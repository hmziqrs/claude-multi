import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ProviderTemplate } from "./templates.js";
import { applyProviderTemplate } from "./templates.js";

export interface McpServer {
  type: "http" | "sse" | "stdio";
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
}

export interface McpConfiguration {
  mcpServers: Record<string, McpServer>;
}

export interface Instance {
  name: string;
  configDir: string;
  binaryPath: string;
  createdAt: string;
}

export interface Config {
  instances: Instance[];
  version: string;
}

const CONFIG_DIR = join(homedir(), ".claude-multi");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export async function loadConfig(): Promise<Config> {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    const defaultConfig: Config = {
      instances: [],
      version: "1.0.0",
    };
    await saveConfig(defaultConfig);
    return defaultConfig;
  }

  const content = await readFile(CONFIG_FILE, "utf-8");
  return JSON.parse(content) as Config;
}

export async function saveConfig(config: Config): Promise<void> {
  ensureConfigDir();
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export async function addInstance(instance: Instance): Promise<void> {
  const config = await loadConfig();

  // Check if instance already exists
  const existing = config.instances.find((i) => i.name === instance.name);
  if (existing) {
    throw new Error(`Instance '${instance.name}' already exists`);
  }

  config.instances.push(instance);
  await saveConfig(config);
}

export async function removeInstance(name: string): Promise<Instance | null> {
  const config = await loadConfig();
  const index = config.instances.findIndex((i) => i.name === name);

  if (index === -1) {
    return null;
  }

  const [removed] = config.instances.splice(index, 1);
  await saveConfig(config);
  return removed ?? null;
}

export async function getInstance(name: string): Promise<Instance | null> {
  const config = await loadConfig();
  const instance = config.instances.find((i) => i.name === name);
  return instance !== undefined ? instance : null;
}

export async function listInstances(): Promise<Instance[]> {
  const config = await loadConfig();
  return config.instances;
}

/**
 * Get the default Claude directory path
 */
export function getDefaultClaudeDir(): string {
  return join(homedir(), ".claude");
}

/**
 * Check if default Claude directory exists and has settings.json
 */
export function hasDefaultClaudeConfig(): boolean {
  const defaultDir = getDefaultClaudeDir();
  const settingsFile = join(defaultDir, "settings.json");
  return existsSync(defaultDir) && existsSync(settingsFile);
}

/**
 * Copy settings.json from default Claude to new instance
 */
export async function copySettingsFromDefault(
  targetConfigDir: string,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();
  const sourceSettings = join(defaultDir, "settings.json");
  const targetSettings = join(targetConfigDir, "settings.json");

  if (!existsSync(sourceSettings)) {
    throw new Error("Default Claude settings.json not found");
  }

  if (!existsSync(targetConfigDir)) {
    await mkdir(targetConfigDir, { recursive: true });
  }

  await copyFile(sourceSettings, targetSettings);
}

/**
 * Copy all files from default Claude to new instance
 * Excludes: config.json, history.jsonl, debug/, session-env/, todos/
 */
export async function copyAllFromDefault(
  targetConfigDir: string,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();

  if (!existsSync(defaultDir)) {
    throw new Error("Default Claude directory not found");
  }

  if (!existsSync(targetConfigDir)) {
    await mkdir(targetConfigDir, { recursive: true });
  }

  const excludeFiles = [
    "config.json",
    ".config.json",
    "history.jsonl",
    "debug",
    "session-env",
    "todos",
    "file-history",
    "shell-snapshots",
    "statsig",
    // MCP-related files to exclude (will be handled separately)
    "mcp-cache",
    "mcp-logs",
    ".mcp-temp",
  ];

  const copyRecursive = async (source: string, target: string) => {
    const entries = readdirSync(source);

    for (const entry of entries) {
      const sourcePath = join(source, entry);
      const targetPath = join(target, entry);
      const stat = statSync(sourcePath);

      // Skip excluded files/directories
      if (excludeFiles.includes(entry)) {
        continue;
      }

      if (stat.isDirectory()) {
        if (!existsSync(targetPath)) {
          await mkdir(targetPath, { recursive: true });
        }
        await copyRecursive(sourcePath, targetPath);
      } else {
        await copyFile(sourcePath, targetPath);
      }
    }
  };

  await copyRecursive(defaultDir, targetConfigDir);
}

/**
 * Detect MCP configurations in a directory
 */
export async function detectMcpConfigurations(
  configDir: string,
): Promise<McpConfiguration | null> {
  if (!existsSync(configDir)) {
    return null;
  }

  // Check for MCP configurations in settings.json
  const settingsFile = join(configDir, "settings.json");
  if (existsSync(settingsFile)) {
    try {
      const settingsContent = await readFile(settingsFile, "utf-8");
      const settings = JSON.parse(settingsContent);

      if (settings.mcpServers && typeof settings.mcpServers === "object") {
        return { mcpServers: settings.mcpServers };
      }
    } catch (error) {
      // Ignore parsing errors, continue to other files
    }
  }

  // Check for separate MCP configuration files
  const mcpFiles = ["mcp.json", "mcp-servers.json", "claude-mcp.json"];

  for (const mcpFile of mcpFiles) {
    const mcpFilePath = join(configDir, mcpFile);
    if (existsSync(mcpFilePath)) {
      try {
        const mcpContent = await readFile(mcpFilePath, "utf-8");
        const mcpConfig = JSON.parse(mcpContent);

        if (mcpConfig.mcpServers && typeof mcpConfig.mcpServers === "object") {
          return mcpConfig as McpConfiguration;
        }
      } catch (error) {
        // Ignore parsing errors, continue to next file
      }
    }
  }

  return null;
}

/**
 * Check if default Claude has MCP configurations
 */
export async function hasDefaultMcpConfig(): Promise<boolean> {
  const defaultDir = getDefaultClaudeDir();
  const mcpConfig = await detectMcpConfigurations(defaultDir);
  return mcpConfig !== null;
}

/**
 * Copy MCP server configurations from default Claude to target instance
 */
export async function copyMcpServersFromDefault(
  targetConfigDir: string,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();
  const mcpConfig = await detectMcpConfigurations(defaultDir);

  if (!mcpConfig) {
    throw new Error("No MCP configurations found in default Claude");
  }

  if (!existsSync(targetConfigDir)) {
    await mkdir(targetConfigDir, { recursive: true });
  }

  // Check if target already has MCP configurations
  const existingMcpConfig = await detectMcpConfigurations(targetConfigDir);

  if (existingMcpConfig) {
    // Merge MCP configurations, with target taking precedence
    const mergedConfig = {
      mcpServers: {
        ...mcpConfig.mcpServers,
        ...existingMcpConfig.mcpServers,
      },
    };

    await writeMcpConfiguration(targetConfigDir, mergedConfig);
  } else {
    // Copy MCP configurations directly
    await writeMcpConfiguration(targetConfigDir, mcpConfig);
  }
}

/**
 * Write MCP configuration to appropriate file in target directory
 */
async function writeMcpConfiguration(
  targetConfigDir: string,
  mcpConfig: McpConfiguration,
): Promise<void> {
  const settingsFile = join(targetConfigDir, "settings.json");

  if (existsSync(settingsFile)) {
    // Update existing settings.json
    try {
      const settingsContent = await readFile(settingsFile, "utf-8");
      const settings = JSON.parse(settingsContent);
      settings.mcpServers = mcpConfig.mcpServers;
      await writeFile(settingsFile, JSON.stringify(settings, null, 2), "utf-8");
      return;
    } catch (error) {
      // If we can't parse/update settings.json, fall back to separate file
    }
  }

  // Create separate mcp.json file
  const mcpFile = join(targetConfigDir, "mcp.json");
  await writeFile(mcpFile, JSON.stringify(mcpConfig, null, 2), "utf-8");
}

/**
 * Copy MCP configurations between instances
 */
export async function copyMcpServersBetweenInstances(
  sourceInstanceName: string,
  targetInstanceName: string,
): Promise<void> {
  const sourceInstance = await getInstance(sourceInstanceName);
  const targetInstance = await getInstance(targetInstanceName);

  if (!sourceInstance) {
    throw new Error(`Source instance '${sourceInstanceName}' not found`);
  }

  if (!targetInstance) {
    throw new Error(`Target instance '${targetInstanceName}' not found`);
  }

  const sourceMcpConfig = await detectMcpConfigurations(
    sourceInstance.configDir,
  );

  if (!sourceMcpConfig) {
    throw new Error(
      `No MCP configurations found in instance '${sourceInstanceName}'`,
    );
  }

  await writeMcpConfiguration(targetInstance.configDir, sourceMcpConfig);
}

/**
 * List MCP servers in an instance
 */
export async function listMcpServers(
  instanceName: string,
): Promise<Record<string, McpServer> | null> {
  const instance = await getInstance(instanceName);

  if (!instance) {
    throw new Error(`Instance '${instanceName}' not found`);
  }

  const mcpConfig = await detectMcpConfigurations(instance.configDir);
  return mcpConfig?.mcpServers || null;
}

/**
 * Create settings.json with provider template
 */
export async function createSettingsFromTemplate(
  targetConfigDir: string,
  template: ProviderTemplate,
  apiKey: string,
): Promise<void> {
  if (!existsSync(targetConfigDir)) {
    await mkdir(targetConfigDir, { recursive: true });
  }

  const settings = applyProviderTemplate(template, apiKey);
  const settingsFile = join(targetConfigDir, "settings.json");

  await writeFile(settingsFile, JSON.stringify(settings, null, 2), "utf-8");
}
