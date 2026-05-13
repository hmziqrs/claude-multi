import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, readlinkSync, rmSync, lstatSync, type Stats } from "node:fs";
import { readFile, writeFile, copyFile, mkdir, symlink } from "node:fs/promises";
import { homedir } from "node:os";
import { randomBytes } from "node:crypto";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import type { ProviderTemplate } from "./templates.js";
import { applyProviderTemplate } from "./templates.js";
import chalk from "chalk";

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

export interface ClaudeSettings {
  enabledPlugins?: Record<string, boolean>;
  mcpServers?: Record<string, McpServer>;
  [key: string]: any;
}

export interface Instance {
  name: string;
  configDir: string;
  binaryPath: string;
  createdAt: string;
  autoSync?: boolean; // Auto-sync plugins/skills via symlinks (default: true)
}

export interface Config {
  instances: Instance[];
  version: string;
}

const CONFIG_DIR = join(homedir(), ".claude-multi");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

const SYNC_DIRS = ["plugins", "skills"] as const;

function lstatSafe(path: string): Stats | null {
  try {
    return lstatSync(path);
  } catch {
    return null;
  }
}

function resolveSymlinkTarget(symlinkPath: string): string | null {
  try {
    const link = readlinkSync(symlinkPath);
    if (isAbsolute(link)) return link;
    return resolve(dirname(symlinkPath), link);
  } catch {
    return null;
  }
}

async function ensureDirSymlink(params: {
  configDir: string;
  sourceBaseDir: string;
  dir: (typeof SYNC_DIRS)[number];
  logLabel?: string;
}): Promise<"linked" | "already" | "skipped"> {
  const { configDir, sourceBaseDir, dir, logLabel } = params;
  const targetPath = join(configDir, dir);
  const sourcePath = join(sourceBaseDir, dir);

  if (!existsSync(sourcePath)) {
    if (logLabel) {
      console.log(chalk.yellow(`  ⚠ Source ${dir} not found in ${logLabel}, skipping`));
    }
    return "skipped";
  }

  const existing = lstatSafe(targetPath);
  if (existing) {
    if (existing.isSymbolicLink()) {
      const resolvedExisting = resolveSymlinkTarget(targetPath);
      if (resolvedExisting === sourcePath) {
        if (logLabel) console.log(chalk.gray(`  ✓ ${dir} already synced`));
        return "already";
      }
      rmSync(targetPath, { force: true });
    } else {
      rmSync(targetPath, { force: true, recursive: true });
    }
  }

  const linkTarget = relative(configDir, sourcePath);
  const type = process.platform === "win32" ? "junction" : "dir";
  await symlink(linkTarget, targetPath, type);

  if (logLabel) {
    console.log(chalk.green(`  ✓ Symlinked: ${dir} -> ${logLabel}/${dir}`));
  }
  return "linked";
}

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

export async function updateInstanceAutoSync(
  name: string,
  autoSync: boolean,
): Promise<Instance | null> {
  const config = await loadConfig();
  const index = config.instances.findIndex((i) => i.name === name);

  if (index === -1) {
    return null;
  }

  config.instances[index].autoSync = autoSync;
  await saveConfig(config);
  return config.instances[index];
}

// Test-only: Override default Claude directory
let _testDefaultClaudeDir: string | undefined;

/**
 * Test-only: Set a custom default Claude directory for testing
 * @internal
 */
export function setTestDefaultClaudeDir(dir: string): void {
  _testDefaultClaudeDir = dir;
}

/**
 * Test-only: Clear the test override for default Claude directory
 * @internal
 */
export function clearTestDefaultClaudeDir(): void {
  _testDefaultClaudeDir = undefined;
}

/**
 * Get the default Claude directory path
 */
export function getDefaultClaudeDir(): string {
  if (_testDefaultClaudeDir) {
    return _testDefaultClaudeDir;
  }
  return join(homedir(), ".claude");
}

/**
 * Check if a symlink is broken (points to non-existent target)
 */
function isBrokenSymlink(path: string): boolean {
  try {
    // Use lstatSync to check if path exists (including broken symlinks)
    const stats = lstatSync(path);
    if (!stats.isSymbolicLink()) return false; // Not a symlink

    // Try to read the link target
    const target = readlinkSync(path);
    if (!target) return true; // No target means broken

    // Check if the target exists
    // For absolute paths, check directly
    // For relative paths, resolve relative to the symlink's directory
    let targetPath: string;
    if (isAbsolute(target)) {
      targetPath = target;
    } else {
      targetPath = resolve(dirname(path), target);
    }

    return !existsSync(targetPath);
  } catch {
    // lstatSync throws for non-existent paths
    return false;
  }
}

/**
 * Detect broken symlinks in an instance
 */
export function detectBrokenSymlinks(configDir: string): {
  broken: string[];
  all: string[];
} {
  const result: { broken: string[]; all: string[] } = { broken: [], all: [] };

  for (const dir of SYNC_DIRS) {
    const targetPath = join(configDir, dir);
    // Use lstatSync instead of existsSync to detect broken symlinks
    try {
      const stats = lstatSync(targetPath);
      result.all.push(dir);
      if (stats.isSymbolicLink() && isBrokenSymlink(targetPath)) {
        result.broken.push(dir);
      }
    } catch {
      // Path doesn't exist at all (not even as a broken symlink)
    }
  }

  return result;
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
 * SECURITY: Only copies safe, non-sensitive settings using a whitelist approach.
 * The "env" key and all sensitive data are never copied to prevent API key exposure.
 */
export async function copySettingsFromDefault(
  targetConfigDir: string,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();
  const sourceSettings = join(defaultDir, "settings.json");

  if (!existsSync(sourceSettings)) {
    throw new Error("Default Claude settings.json not found");
  }

  // Read the source settings
  const content = await readFile(sourceSettings, "utf-8");
  const settings = JSON.parse(content);

  // Filter out sensitive data - only copy safe settings
  const safeSettings: Record<string, unknown> = {};

  // Safe settings whitelist - only these keys will be copied
  const SAFE_SETTINGS = [
    'includeCoAuthoredBy',
    'alwaysThinkingEnabled',
    'enabledPlugins'
  ];

  // Only copy whitelisted settings
  for (const key of SAFE_SETTINGS) {
    if (settings[key] !== undefined) {
      safeSettings[key] = settings[key];
    }
  }

  // SECURITY: The whitelist approach ensures the "env" key is NEVER copied
  // along with any other sensitive data not in the whitelist

  // Write filtered settings
  if (!existsSync(targetConfigDir)) {
    await mkdir(targetConfigDir, { recursive: true });
  }

  const targetSettings = join(targetConfigDir, "settings.json");
  await writeFile(targetSettings, JSON.stringify(safeSettings, null, 2), "utf-8");
}

/**
 * Copy all files from default Claude to new instance
 * When autoSync is true, uses symlinks for plugins and skills directories
 * Excludes: config.json, history.jsonl, debug/, session-env/, todos/
 */
export async function copyAllFromDefault(
  targetConfigDir: string,
  autoSync = true,
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
    ".claude.json",
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
        // Use symlink for plugins and skills when autoSync is enabled
        if (autoSync && (SYNC_DIRS as readonly string[]).includes(entry)) {
          await ensureDirSymlink({
            configDir: target,
            sourceBaseDir: defaultDir,
            dir: entry as (typeof SYNC_DIRS)[number],
          });
        } else {
          if (!existsSync(targetPath)) {
            await mkdir(targetPath, { recursive: true });
          }
          await copyRecursive(sourcePath, targetPath);
        }
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

  if (!existsSync(targetConfigDir)) {
    await mkdir(targetConfigDir, { recursive: true });
  }

  // Symlink plugins directory — MCP servers come from plugins
  const pluginsDir = join(targetConfigDir, "plugins");
  const defaultPluginsDir = join(defaultDir, "plugins");
  if (existsSync(defaultPluginsDir) && !existsSync(pluginsDir)) {
    await ensureDirSymlink({
      configDir: targetConfigDir,
      sourceBaseDir: defaultDir,
      dir: "plugins",
    });
  }

  // Also copy any explicit mcpServers from settings.json
  const mcpConfig = await detectMcpConfigurations(defaultDir);
  if (mcpConfig) {
    const existingMcpConfig = await detectMcpConfigurations(targetConfigDir);
    if (existingMcpConfig) {
      const mergedConfig = {
        mcpServers: {
          ...mcpConfig.mcpServers,
          ...existingMcpConfig.mcpServers,
        },
      };
      await writeMcpConfiguration(targetConfigDir, mergedConfig);
    } else {
      await writeMcpConfiguration(targetConfigDir, mcpConfig);
    }
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

/**
 * Initialize .claude.json state to skip onboarding screens
 */
export async function initializeInstanceState(
  configDir: string,
): Promise<void> {
  const stateFile = join(configDir, ".claude.json");
  if (existsSync(stateFile)) return;

  if (!existsSync(configDir)) {
    await mkdir(configDir, { recursive: true });
  }

  const state = {
    numStartups: 1,
    installMethod: "global",
    autoUpdates: false,
    hasSeenTasksHint: true,
    hasCompletedOnboarding: true,
    lastOnboardingVersion: "2.0.31",
    firstStartTime: new Date().toISOString(),
    userID: randomBytes(32).toString("hex"),
    promptQueueUseCount: 0,
    sonnet45MigrationComplete: true,
    opus45MigrationComplete: true,
    thinkingMigrationComplete: true,
    sonnet1m45MigrationComplete: true,
    opusProMigrationComplete: true,
    migrationVersion: 13,
  };

  await writeFile(stateFile, JSON.stringify(state, null, 2), "utf-8");
}

/**
 * Merge provider template env vars into existing settings.json
 */
export async function mergeProviderEnv(
  configDir: string,
  template: ProviderTemplate,
  apiKey: string,
): Promise<void> {
  const settingsFile = join(configDir, "settings.json");

  let existing: Record<string, unknown> = {};
  if (existsSync(settingsFile)) {
    const raw = await readFile(settingsFile, "utf-8");
    existing = JSON.parse(raw);
  }

  const env = (existing.env as Record<string, string>) ?? {};
  const templateEnv = JSON.parse(JSON.stringify(template.settings.env));
  templateEnv.ANTHROPIC_AUTH_TOKEN = apiKey;

  existing.env = { ...env, ...templateEnv };
  existing.includeCoAuthoredBy = template.settings.includeCoAuthoredBy;

  await writeFile(settingsFile, JSON.stringify(existing, null, 2), "utf-8");
}

/**
 * Sync plugins and skills via symlinks for an existing instance
 */
export async function syncPluginsAndSkills(
  configDir: string,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();

  if (!existsSync(configDir)) {
    throw new Error("Instance config directory does not exist");
  }

  for (const dir of SYNC_DIRS) {
    await ensureDirSymlink({
      configDir,
      sourceBaseDir: defaultDir,
      dir,
      logLabel: defaultDir,
    });
  }
}

/**
 * Unsync plugins and skills by copying actual files and removing symlinks
 */
export async function unsyncPluginsAndSkills(
  configDir: string,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();

  if (!existsSync(configDir)) {
    throw new Error("Instance config directory does not exist");
  }

  for (const dir of SYNC_DIRS) {
    const targetPath = join(configDir, dir);
    const sourcePath = join(defaultDir, dir);

    // Skip if source doesn't exist
    if (!existsSync(sourcePath)) {
      console.log(chalk.yellow(`  ⚠ Source ${dir} not found in ${defaultDir}, skipping`));
      continue;
    }

    // Check if it's currently a symlink
    let isSymlink = false;
    try {
      readlinkSync(targetPath);
      isSymlink = true;
    } catch {
      // Not a symlink
    }

    if (isSymlink) {
      // Remove symlink
      rmSync(targetPath, { force: true });
      console.log(chalk.gray(`  ✓ Removed symlink for ${dir}`));
    } else if (!existsSync(targetPath)) {
      // Neither symlink nor directory exists
    } else {
      console.log(chalk.yellow(`  ⚠ ${dir} is already a regular directory, skipping`));
      continue;
    }

    // Copy files from source
    await mkdir(targetPath, { recursive: true });
    const copyRecursive = async (source: string, target: string) => {
      const entries = readdirSync(source);
      for (const entry of entries) {
        const sourceEntry = join(source, entry);
        const targetEntry = join(target, entry);
        const stat = statSync(sourceEntry);

        if (stat.isDirectory()) {
          await mkdir(targetEntry, { recursive: true });
          await copyRecursive(sourceEntry, targetEntry);
        } else {
          await copyFile(sourceEntry, targetEntry);
        }
      }
    };
    await copyRecursive(sourcePath, targetPath);
    console.log(chalk.green(`  ✓ Copied files for ${dir}`));
  }
}

/**
 * Read Claude settings.json file
 */
export async function readClaudeSettings(
  configDir: string,
): Promise<ClaudeSettings | null> {
  const settingsFile = join(configDir, "settings.json");

  if (!existsSync(settingsFile)) {
    return null;
  }

  try {
    const content = await readFile(settingsFile, "utf-8");
    return JSON.parse(content) as ClaudeSettings;
  } catch (error) {
    console.error(chalk.yellow(`Warning: Failed to parse settings.json: ${error}`));
    return null;
  }
}

/**
 * Write Claude settings.json file
 */
export async function writeClaudeSettings(
  configDir: string,
  settings: ClaudeSettings,
): Promise<void> {
  const settingsFile = join(configDir, "settings.json");

  if (!existsSync(configDir)) {
    await mkdir(configDir, { recursive: true });
  }

  await writeFile(settingsFile, JSON.stringify(settings, null, 2), "utf-8");
}

/**
 * Get enabled plugins from a Claude instance
 */
export async function getEnabledPlugins(
  configDir: string,
): Promise<Record<string, boolean> | null> {
  const settings = await readClaudeSettings(configDir);
  return settings?.enabledPlugins || null;
}

/**
 * Set enabled plugins for a Claude instance
 */
export async function setEnabledPlugins(
  configDir: string,
  enabledPlugins: Record<string, boolean>,
): Promise<void> {
  const settings = (await readClaudeSettings(configDir)) || {};
  settings.enabledPlugins = enabledPlugins;
  await writeClaudeSettings(configDir, settings);
}

/**
 * Enable a plugin for a Claude instance
 */
export async function enablePlugin(
  configDir: string,
  pluginId: string,
): Promise<void> {
  const settings = (await readClaudeSettings(configDir)) || {};
  if (!settings.enabledPlugins) {
    settings.enabledPlugins = {};
  }
  settings.enabledPlugins[pluginId] = true;
  await writeClaudeSettings(configDir, settings);
}

/**
 * Disable a plugin for a Claude instance
 */
export async function disablePlugin(
  configDir: string,
  pluginId: string,
): Promise<void> {
  const settings = (await readClaudeSettings(configDir)) || {};
  if (!settings.enabledPlugins) {
    settings.enabledPlugins = {};
  }
  settings.enabledPlugins[pluginId] = false;
  await writeClaudeSettings(configDir, settings);
}

/**
 * List all available plugins from default Claude
 */
export async function listAvailablePlugins(): Promise<Record<string, boolean> | null> {
  const defaultSettings = await readClaudeSettings(getDefaultClaudeDir());
  return defaultSettings?.enabledPlugins || null;
}
