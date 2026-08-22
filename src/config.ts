import { existsSync, mkdirSync, readdirSync, statSync, readlinkSync, rmSync, lstatSync, readFileSync, writeFileSync, renameSync, type Stats } from "node:fs";
import { readFile, writeFile, copyFile, mkdir, symlink } from "node:fs/promises";
import { homedir } from "node:os";
import { randomBytes } from "node:crypto";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import type { ProviderTemplate, ProviderEnvSyncResult } from "@/templates";
import { applyProviderTemplate, syncProviderEnvToSettings } from "@/templates";
import { writeJsonFileAtomic } from "@/util/json-file";
import { ClaudeMultiError, ErrorCode } from "@/errors";
import { MigrationStatus, PluginCategory, McpServerType, PluginAction, SyncMode, type SyncMode as SyncModeType, canConvertSyncMode } from "@/constants";
import chalk from "chalk";

export interface McpServer {
  type: McpServerType;
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
}

export interface Instance {
  name: string;
  configDir: string;
  binaryPath: string;
  createdAt: string;
  /** @deprecated Use syncMode instead. Kept for backward compat — resolved via getSyncMode(). */
  autoSync?: boolean;
  /** Sync mode: "auto" | "half-manual" | "full-manual". Defaults to "auto" if unset and autoSync is not explicitly false. */
  syncMode?: SyncModeType;
  createdWithVersion: string; // claude-multi version that created this instance
  providerTemplate?: string; // e.g. "mimo", "kimi", "qwen-coding"
  providerRegion?: string;   // e.g. "sgp", "ams", "cn" for regional providers
}

export interface Config {
  instances: Instance[];
  version: string;
  migrationMeta?: MigrationMeta;
  instanceMigrationVersion?: string;
}

export interface MigrationMeta {
  lastMigrationAt?: string;
  migratedFromVersion?: string;
  migrationStatus: MigrationStatus;
  failureInfo?: {
    failedAt: string;
    error: string;
    step: string;
    instanceName?: string;
    canRetry: boolean;
  };
}

export interface PluginInfo {
  id: string;
  name: string;
  description: string;
  category: PluginCategory;
  hasMcp: boolean;
  mcpServerNames?: string[];
  enabled: boolean;
  isSymlink: boolean;
}

let _testConfigDir: string | undefined;

/** Test-only: isolate config storage from ~/.claude-multi */
export function setTestConfigDir(dir: string): void { _testConfigDir = dir; }
/** Test-only: restore real config storage */
export function clearTestConfigDir(): void { _testConfigDir = undefined; }

function getConfigDir(): string { return _testConfigDir ?? join(homedir(), ".claude-multi"); }
function getConfigFile(): string { return join(getConfigDir(), "config.json"); }

const SYNC_DIRS = ["plugins", "skills"] as const;

const VALID_SYNC_MODES = new Set<string>(Object.values(SyncMode));

/**
 * Resolve the effective sync mode for an instance.
 * Priority: syncMode field > autoSync field > default "auto"
 */
export function getSyncMode(instance: Instance): SyncModeType {
  if (instance.syncMode && VALID_SYNC_MODES.has(instance.syncMode)) return instance.syncMode;
  // Backward compat: explicit autoSync=false means full-manual
  if (instance.autoSync === false) return SyncMode.FullManual;
  // autoSync=true or undefined defaults to auto
  return SyncMode.Auto;
}

/** Human-readable label for a sync mode */
export function syncModeLabel(mode: SyncModeType): string {
  switch (mode) {
    case SyncMode.Auto: return "Auto-sync (symlink dirs)";
    case SyncMode.HalfManual: return "Half-manual (symlink items)";
    case SyncMode.FullManual: return "Full-manual (independent copy)";
  }
}

async function copyDirRecursive(source: string, target: string): Promise<void> {
  if (!existsSync(target)) {
    await mkdir(target, { recursive: true });
  }
  const entries = readdirSync(source);
  await Promise.all(entries.map(async (entry) => {
    const src = join(source, entry);
    const tgt = join(target, entry);
    const s = statSync(src);
    if (s.isDirectory()) {
      await copyDirRecursive(src, tgt);
    } else {
      await copyFile(src, tgt);
    }
  }));
}

function lstatSafe(path: string): Stats | null {
  try {
    return lstatSync(path);
  } catch {
    return null;
  }
}

export function ensureConfigDir(): void {
  if (!existsSync(getConfigDir())) {
    mkdirSync(getConfigDir(), { recursive: true });
  }
}

function isConfig(raw: unknown): raw is Config {
  return (
    typeof raw === "object" && raw !== null &&
    Array.isArray((raw as Config).instances) &&
    typeof (raw as Config).version === "string"
  );
}

export async function loadConfig(): Promise<Config> {
  ensureConfigDir();

  if (!existsSync(getConfigFile())) {
    const defaultConfig: Config = {
      instances: [],
      version: "2.0.0",
    };
    await saveConfig(defaultConfig);
    return defaultConfig;
  }

  const content = await readFile(getConfigFile(), "utf-8");
  let config: Config;
  try {
    const raw = JSON.parse(content);
    if (!isConfig(raw)) {
      throw new ClaudeMultiError(ErrorCode.CONFIG_CORRUPTED, "Config file has an unexpected shape", { cause: raw });
    }
    config = raw;
  } catch (err: unknown) {
    if (err instanceof ClaudeMultiError) throw err;
    throw new ClaudeMultiError(ErrorCode.CONFIG_CORRUPTED, `Config file is corrupted: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }

  // Run migration if needed
  const { needsMigration, runMigration, LEGACY_INSTANCE_VERSION } = await import("./migration.js");
  if (needsMigration(config)) {
    config = await runMigration(config);
    await saveConfigAtomic(config);
  }

  // Auto-backfill missing createdWithVersion (default value, not a migration)
  let backfilled = false;
  for (let i = 0; i < config.instances.length; i++) {
    const inst = config.instances[i]!;
    if (!inst.createdWithVersion) {
      config.instances[i] = { ...inst, createdWithVersion: LEGACY_INSTANCE_VERSION };
      backfilled = true;
    }
  }
  if (backfilled) {
    await saveConfigAtomic(config);
  }

  return config;
}

export async function saveConfig(config: Config): Promise<void> {
  ensureConfigDir();
  await writeFile(getConfigFile(), JSON.stringify(config, null, 2), "utf-8");
}

export async function saveConfigAtomic(config: Config): Promise<void> {
  ensureConfigDir();
  await writeJsonFileAtomic(getConfigFile(), config);
}

export async function addInstance(instance: Instance): Promise<void> {
  const config = await loadConfig();

  // Check if instance already exists
  const existing = config.instances.find((i) => i.name === instance.name);
  if (existing) {
    throw new ClaudeMultiError(ErrorCode.INSTANCE_ALREADY_EXISTS, `Instance '${instance.name}' already exists`);
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

  const inst = config.instances[index]!;
  inst.autoSync = autoSync;
  // Also set syncMode for forward compat
  inst.syncMode = autoSync ? SyncMode.Auto : SyncMode.FullManual;
  await saveConfig(config);
  return inst;
}

/**
 * Update the sync mode for an instance and apply the filesystem changes.
 * Only allows downgrades (auto → half-manual → full-manual).
 */
export async function updateInstanceSyncMode(
  name: string,
  newMode: SyncModeType,
): Promise<Instance | null> {
  const config = await loadConfig();
  const index = config.instances.findIndex((i) => i.name === name);

  if (index === -1) {
    return null;
  }

  const inst = config.instances[index]!;
  const currentMode = getSyncMode(inst);

  // Validate downgrade-only rule
  if (currentMode === newMode) return inst;
  if (!canConvertSyncMode(currentMode, newMode)) {
    throw new ClaudeMultiError(ErrorCode.SYMLINK_CONFLICT, `Cannot convert from ${syncModeLabel(currentMode)} to ${syncModeLabel(newMode)}. Only downgrades are allowed.`);
  }

  // Apply filesystem changes
  if (newMode === SyncMode.Auto) {
    await syncPluginsAndSkills(inst.configDir);
  } else if (newMode === SyncMode.HalfManual) {
    // If coming from auto (whole-dir symlinks), convert to individual symlinks
    if (currentMode === SyncMode.Auto) {
      await halfSyncPluginsAndSkills(inst.configDir);
    }
  } else if (newMode === SyncMode.FullManual) {
    // If coming from auto or half-manual, replace all symlinks with copies
    await unsyncPluginsAndSkills(inst.configDir);
  }

  // Persist
  inst.syncMode = newMode;
  // Update autoSync for backward compat
  inst.autoSync = newMode === SyncMode.Auto ? true : false;
  await saveConfig(config);
  return inst;
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
 * Detect broken symlinks in an instance.
 * Checks both whole-directory symlinks (auto-sync) and
 * individual item symlinks inside real directories (half-manual).
 */
export function detectBrokenSymlinks(configDir: string): {
  broken: string[];
  all: string[];
} {
  const result: { broken: string[]; all: string[] } = { broken: [], all: [] };

  for (const dir of SYNC_DIRS) {
    const targetPath = join(configDir, dir);
    try {
      const stats = lstatSync(targetPath);
      result.all.push(dir);

      if (stats.isSymbolicLink()) {
        // Whole-directory symlink (auto-sync mode)
        if (isBrokenSymlink(targetPath)) {
          result.broken.push(dir);
        }
      } else if (stats.isDirectory()) {
        // Real directory — check for broken individual symlinks (half-manual mode)
        try {
          const entries = readdirSync(targetPath, { withFileTypes: true });
          for (const entry of entries) {
            const entryPath = join(targetPath, entry.name);
            if (isBrokenSymlink(entryPath)) {
              result.broken.push(`${dir}/${entry.name}`);
            }
          }
        } catch { /* permission error, skip */ }
      }
    } catch {
      // Path doesn't exist at all
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
    throw new ClaudeMultiError(ErrorCode.DEFAULT_SETTINGS_NOT_FOUND, "Default Claude settings.json not found");
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
 * Excludes: config.json, history.jsonl, debug/, session-env/, todos/
 */
export async function copyAllFromDefault(
  targetConfigDir: string,
  syncModeOrAutoSync: SyncModeType | boolean = false,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();

  if (!existsSync(defaultDir)) {
    throw new ClaudeMultiError(ErrorCode.DEFAULT_DIR_NOT_FOUND, "Default Claude directory not found");
  }

  if (!existsSync(targetConfigDir)) {
    await mkdir(targetConfigDir, { recursive: true });
  }

  // Resolve legacy boolean to SyncMode
  const effectiveMode: SyncModeType = typeof syncModeOrAutoSync === "boolean"
    ? (syncModeOrAutoSync ? SyncMode.Auto : SyncMode.FullManual)
    : syncModeOrAutoSync;

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

  const excludeSet = new Set(excludeFiles);
  const syncDirSet = new Set(SYNC_DIRS as readonly string[]);

  const copyRecursive = async (source: string, target: string) => {
    const entries = readdirSync(source);

    for (const entry of entries) {
      const sourcePath = join(source, entry);
      const targetPath = join(target, entry);
      const stat = statSync(sourcePath);

      // Skip excluded files/directories
      if (excludeSet.has(entry)) {
        continue;
      }

      if (stat.isDirectory()) {
        if (syncDirSet.has(entry)) {
          if (effectiveMode === SyncMode.Auto) {
            // Auto mode: symlink the entire directory
            try {
              const targetStat = lstatSync(targetPath);
              if (targetStat.isSymbolicLink()) {
                const currentTarget = readlinkSync(targetPath);
                if (currentTarget === sourcePath) {
                  console.log(`  ✓ Already symlinked: ${entry}`);
                  continue;
                }
                console.log(chalk.yellow(`  ⚠ Replacing incorrect symlink: ${entry}`));
              } else {
                console.log(chalk.yellow(`  ⚠ Removing existing directory: ${entry}`));
              }
              rmSync(targetPath, { force: true, recursive: true });
            } catch {
              // Path doesn't exist — nothing to clean up
            }
            await symlink(sourcePath, targetPath, "dir");
            console.log(`  Symlinked: ${entry} -> ${sourcePath}`);
          } else if (effectiveMode === SyncMode.HalfManual) {
            // Half-manual mode: create real dir, symlink individual items
            if (!existsSync(targetPath)) {
              await mkdir(targetPath, { recursive: true });
            }
            const subEntries = readdirSync(sourcePath, { withFileTypes: true });
            let linked = 0;
            for (const sub of subEntries) {
              const subSource = join(sourcePath, sub.name);
              const subTarget = join(targetPath, sub.name);
              if (lstatSafe(subTarget)) continue; // don't overwrite existing
              const rel = relative(dirname(subTarget), subSource);
              await symlink(rel, subTarget, sub.isDirectory() ? "dir" : "file");
              linked++;
            }
            console.log(`  Half-synced: ${entry} (${linked} items individually symlinked)`);
          } else {
            // Full-manual: just copy
            if (!existsSync(targetPath)) {
              await mkdir(targetPath, { recursive: true });
            }
            await copyRecursive(sourcePath, targetPath);
          }
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
    } catch {
      // Ignore parsing errors, continue to other files
    }
  }

  // Check for separate MCP configuration files
  const mcpFiles = ["mcp.json", "mcp-servers.json", "claude-mcp.json"];

  for (const mcpFile of mcpFiles) {
    const mcpFilePath = join(configDir, mcpFile);
    if (existsSync(mcpFilePath)) {
      try {
        // eslint-disable-next-line @react-doctor/async-await-in-loop -- short-circuit return on first valid config
        const mcpContent = await readFile(mcpFilePath, "utf-8");
        const mcpConfig = JSON.parse(mcpContent);

        if (mcpConfig.mcpServers && typeof mcpConfig.mcpServers === "object") {
          return mcpConfig as McpConfiguration;
        }
      } catch {
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

  // Copy plugins directory — MCP servers come from plugins
  const pluginsDir = join(targetConfigDir, "plugins");
  const defaultPluginsDir = join(defaultDir, "plugins");
  if (existsSync(defaultPluginsDir) && !existsSync(pluginsDir)) {
    await copyDirRecursive(defaultPluginsDir, pluginsDir);
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
    } catch {
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
  const [sourceInstance, targetInstance] = await Promise.all([
    getInstance(sourceInstanceName),
    getInstance(targetInstanceName),
  ]);

  if (!sourceInstance) {
    throw new ClaudeMultiError(ErrorCode.INSTANCE_NOT_FOUND, `Source instance '${sourceInstanceName}' not found`);
  }

  if (!targetInstance) {
    throw new ClaudeMultiError(ErrorCode.INSTANCE_NOT_FOUND, `Target instance '${targetInstanceName}' not found`);
  }

  const sourceMcpConfig = await detectMcpConfigurations(
    sourceInstance.configDir,
  );

  if (!sourceMcpConfig) {
    throw new ClaudeMultiError(ErrorCode.MCP_NOT_FOUND, `No MCP configurations found in instance '${sourceInstanceName}'`);
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
    throw new ClaudeMultiError(ErrorCode.INSTANCE_NOT_FOUND, `Instance '${instanceName}' not found`);
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
    autoUpdates: true, // [SAFE PARK] set to false if a future Claude Code version breaks 3rd-party providers; claude-multi no longer bundles claude-code so this protects the user-installed binary
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
  const templateSettings = applyProviderTemplate(template, apiKey) as { env: Record<string, string> };

  existing.env = { ...env, ...templateSettings.env };
  existing.includeCoAuthoredBy = template.settings.includeCoAuthoredBy;

  await writeFile(settingsFile, JSON.stringify(existing, null, 2), "utf-8");
}

/**
 * Sync provider template env vars for a single instance.
 * Re-applies the latest template (model names, thinking limits, etc.)
 * while preserving the API key and any user-customized tunable vars.
 * Tunables still holding a known legacy default from an older template
 * are refreshed (see LEGACY_ENV_DEFAULTS).
 *
 * This is the user-triggered standalone version that runs on-demand
 * from the UI; migrations use the same shared sync implementation.
 */
export async function syncProviderTemplateForInstance(instance: Instance): Promise<void> {
  let result: ProviderEnvSyncResult;
  try {
    result = syncProviderEnvToSettings(instance.configDir, {
      providerTemplate: instance.providerTemplate,
      providerRegion: instance.providerRegion,
      tunablePolicy: "overwrite-legacy-defaults",
    });
  } catch (err: unknown) {
    // Surface IO/parse failures with the same context the direct implementation used to give
    throw new ClaudeMultiError(
      ErrorCode.CONFIG_CORRUPTED,
      `Failed to sync provider template for '${instance.name}': ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (result.status === "skipped") {
    if (result.reason === "no-settings") {
      throw new ClaudeMultiError(ErrorCode.INSTANCE_DIR_NOT_FOUND, `No settings.json found for '${instance.name}'`);
    }
    throw new ClaudeMultiError(ErrorCode.INSTANCE_NOT_FOUND, result.providerName
      ? `Unknown provider template '${result.providerName}'`
      : `Could not detect provider for '${instance.name}'`);
  }

  // Backfill providerTemplate / providerRegion on the instance in config
  let needsSave = false;
  const config = await loadConfig();
  const inst = config.instances.find(i => i.name === instance.name);
  if (inst) {
    if (!inst.providerTemplate && result.providerName) {
      inst.providerTemplate = result.providerName;
      needsSave = true;
    }
    if (result.region && !inst.providerRegion) {
      inst.providerRegion = result.region;
      needsSave = true;
    }
    if (needsSave) {
      await saveConfigAtomic(config);
    }
  }
}

/**
 * Copy plugins and skills from default Claude to an existing instance
 */
export async function syncPluginsAndSkills(
  configDir: string,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();

  if (!existsSync(configDir)) {
    throw new ClaudeMultiError(ErrorCode.INSTANCE_DIR_NOT_FOUND, "Instance config directory does not exist");
  }

  await Promise.all(SYNC_DIRS.map(async (dir) => {
    const targetPath = join(configDir, dir);
    const sourcePath = join(defaultDir, dir);

    if (!existsSync(sourcePath)) {
      console.log(chalk.yellow(`  ⚠ Source ${dir} not found in ${defaultDir}, skipping`));
      return;
    }

    if (existsSync(targetPath)) {
      try {
        const linkTarget = readlinkSync(targetPath);
        if (linkTarget === sourcePath || linkTarget === join("..", "..", ".claude", dir)) {
          console.log(chalk.gray(`  ✓ ${dir} already synced`));
          return;
        }
        rmSync(targetPath, { force: true });
      } catch {
        rmSync(targetPath, { force: true, recursive: true });
      }
    }

    const relativePath = relative(dirname(targetPath), sourcePath);
    await symlink(relativePath, targetPath, "dir");
    console.log(chalk.green(`  ✓ Symlinked: ${dir} -> ${sourcePath}`));
  }));
}

async function copyFilesRecursive(source: string, target: string): Promise<void> {
  const entries = readdirSync(source);
  await Promise.all(entries.map(async (entry) => {
    const sourceEntry = join(source, entry);
    const targetEntry = join(target, entry);
    const stat = statSync(sourceEntry);

    if (stat.isDirectory()) {
      await mkdir(targetEntry, { recursive: true });
      await copyFilesRecursive(sourceEntry, targetEntry);
    } else {
      await copyFile(sourceEntry, targetEntry);
    }
  }));
}

/**
 * Half-manual sync: replace whole-directory symlinks with real directories
 * containing individual symlinks for each existing plugin/skill.
 * New items installed in ~/.claude won't appear here automatically.
 */
export async function halfSyncPluginsAndSkills(
  configDir: string,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();

  if (!existsSync(configDir)) {
    throw new ClaudeMultiError(ErrorCode.INSTANCE_DIR_NOT_FOUND, "Instance config directory does not exist");
  }

  await Promise.all(SYNC_DIRS.map(async (dir) => {
    const targetPath = join(configDir, dir);
    const sourcePath = join(defaultDir, dir);

    if (!existsSync(sourcePath)) {
      console.log(chalk.yellow(`  ⚠ Source ${dir} not found in ${defaultDir}, skipping`));
      return;
    }

    // If target is a whole-dir symlink (auto-sync mode), convert it
    let wasWholeDirSymlink = false;
    try {
      const stat = lstatSync(targetPath);
      if (stat.isSymbolicLink()) {
        rmSync(targetPath, { force: true });
        wasWholeDirSymlink = true;
        console.log(chalk.gray(`  ✓ Removed directory symlink for ${dir}`));
      }
    } catch { /* not a symlink, good */ }

    // Ensure the real directory exists
    if (!existsSync(targetPath)) {
      await mkdir(targetPath, { recursive: true });
    }

    // Create individual symlinks for each item in the source directory
    const entries = readdirSync(sourcePath, { withFileTypes: true });
    let linked = 0;
    for (const entry of entries) {
      const sourceEntry = join(sourcePath, entry.name);
      const targetEntry = join(targetPath, entry.name);

      // Skip if target already exists (as symlink or real file/dir)
      const existingStat = lstatSafe(targetEntry);
      if (existingStat) {
        // If it's already a symlink pointing to the right place, skip
        if (existingStat.isSymbolicLink()) {
          try {
            const currentTarget = readlinkSync(targetEntry);
            const resolvedTarget = isAbsolute(currentTarget)
              ? currentTarget
              : resolve(dirname(targetEntry), currentTarget);
            if (resolvedTarget === sourceEntry) {
              linked++;
              continue;
            }
          } catch { /* broken symlink, replace it */ }
          // Points elsewhere — remove and re-link
          rmSync(targetEntry, { force: true });
        } else {
          // Real file/dir exists — don't overwrite user's own content
          continue;
        }
      }

      // Create relative symlink for this individual item
      const relativePath = relative(dirname(targetEntry), sourceEntry);
      await symlink(relativePath, targetEntry, entry.isDirectory() ? "dir" : "file");
      linked++;
    }

    console.log(chalk.green(`  ✓ Half-synced ${dir}: ${linked} item(s) individually symlinked`));
  }));
}

/**
 * Unsync plugins and skills by copying actual files and removing symlinks.
 * Handles both auto-sync (whole-dir symlinks) and half-manual (individual symlinks).
 */
export async function unsyncPluginsAndSkills(
  configDir: string,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();

  if (!existsSync(configDir)) {
    throw new ClaudeMultiError(ErrorCode.INSTANCE_DIR_NOT_FOUND, "Instance config directory does not exist");
  }

  await Promise.all(SYNC_DIRS.map(async (dir) => {
    const targetPath = join(configDir, dir);
    const sourcePath = join(defaultDir, dir);

    // Skip if source doesn't exist
    if (!existsSync(sourcePath)) {
      console.log(chalk.yellow(`  ⚠ Source ${dir} not found in ${defaultDir}, skipping`));
      return;
    }

    // Check if it's a whole-directory symlink (auto-sync mode)
    let isWholeDirSymlink = false;
    try {
      readlinkSync(targetPath);
      isWholeDirSymlink = true;
    } catch {
      // Not a symlink
    }

    if (isWholeDirSymlink) {
      // Remove the whole-directory symlink
      rmSync(targetPath, { force: true });
      console.log(chalk.gray(`  ✓ Removed directory symlink for ${dir}`));
      // Copy files from source
      await mkdir(targetPath, { recursive: true });
      await copyFilesRecursive(sourcePath, targetPath);
      console.log(chalk.green(`  ✓ Copied files for ${dir}`));
    } else if (!existsSync(targetPath)) {
      // Neither symlink nor directory exists — just copy
      await mkdir(targetPath, { recursive: true });
      await copyFilesRecursive(sourcePath, targetPath);
      console.log(chalk.green(`  ✓ Copied files for ${dir}`));
    } else {
      // Real directory — may be half-manual with individual symlinks inside
      // Replace individual symlinks with real copies
      let replaced = 0;
      const entries = readdirSync(targetPath, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = join(targetPath, entry.name);
        const entryStat = lstatSafe(entryPath);
        if (entryStat?.isSymbolicLink()) {
          // Resolve symlink target to get the real content
          const linkTarget = readlinkSync(entryPath);
          const resolvedTarget = isAbsolute(linkTarget)
            ? linkTarget
            : resolve(dirname(entryPath), linkTarget);

          // Remove symlink and copy the real content
          rmSync(entryPath, { force: true });
          if (existsSync(resolvedTarget)) {
            const realStat = statSync(resolvedTarget);
            if (realStat.isDirectory()) {
              await mkdir(entryPath, { recursive: true });
              await copyDirRecursive(resolvedTarget, entryPath);
            } else {
              await copyFile(resolvedTarget, entryPath);
            }
            replaced++;
          }
        }
      }

      // Also copy any items from source that don't exist in target yet
      const sourceEntries = readdirSync(sourcePath, { withFileTypes: true });
      for (const entry of sourceEntries) {
        const targetEntry = join(targetPath, entry.name);
        if (!existsSync(targetEntry)) {
          const sourceEntry = join(sourcePath, entry.name);
          if (entry.isDirectory()) {
            await mkdir(targetEntry, { recursive: true });
            await copyDirRecursive(sourceEntry, targetEntry);
          } else {
            await copyFile(sourceEntry, targetEntry);
          }
          replaced++;
        }
      }

      if (replaced > 0) {
        console.log(chalk.green(`  ✓ ${dir}: replaced ${replaced} symlink(s) with copies`));
      } else {
        console.log(chalk.gray(`  ✓ ${dir}: already fully independent`));
      }
    }
  }));
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
  } catch (error: unknown) {
    console.error(chalk.yellow(`Warning: Failed to parse settings.json: ${error}`));
    return null;
  }
}

/**
 * Write Claude settings.json file (atomic)
 */
export async function writeClaudeSettings(
  configDir: string,
  settings: ClaudeSettings,
): Promise<void> {
  if (!existsSync(configDir)) {
    await mkdir(configDir, { recursive: true });
  }
  await writeJsonFileAtomic(join(configDir, "settings.json"), settings);
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

// ── Plugin Discovery ──────────────────────────────────────────────

const MARKETPLACE_REL = "plugins/marketplaces/claude-plugins-official";

function readMcpJsonFile(mcpPath: string): Record<string, McpServer> {
  try {
    const raw = JSON.parse(readFileSync(mcpPath, "utf-8"));
    // Nested format: { "mcpServers": { ... } }
    if (raw.mcpServers && typeof raw.mcpServers === "object") {
      return raw.mcpServers as Record<string, McpServer>;
    }
    // Flat format: { "serverName": { ... } }
    const servers: Record<string, McpServer> = {};
    for (const [key, val] of Object.entries(raw)) {
      if (val && typeof val === "object") {
        servers[key] = val as McpServer;
      }
    }
    return servers;
  } catch {
    return {};
  }
}

function scanPluginDir(
  baseDir: string,
  category: PluginCategory,
  enabledPlugins: Record<string, boolean>,
): PluginInfo[] {
  const subDir = category === PluginCategory.Internal ? "plugins" : "external_plugins";
  const dir = join(baseDir, MARKETPLACE_REL, subDir);
  if (!existsSync(dir)) return [];

  const results: PluginInfo[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pluginPath = join(dir, entry.name);

    // Read metadata
    let name = entry.name;
    let description = "";
    const metaFile = join(pluginPath, ".claude-plugin", "plugin.json");
    if (existsSync(metaFile)) {
      try {
        const meta = JSON.parse(readFileSync(metaFile, "utf-8"));
        if (meta.name) name = meta.name;
        if (meta.description) description = meta.description;
      } catch {
        console.error(chalk.yellow(`Warning: Could not parse plugin metadata for ${entry.name}`));
      }
    }

    // Check MCP
    const mcpFile = join(pluginPath, ".mcp.json");
    const hasMcp = existsSync(mcpFile);
    let mcpServerNames: string[] | undefined;
    if (hasMcp) {
      const servers = readMcpJsonFile(mcpFile);
      mcpServerNames = Object.keys(servers);
    }

    // Check enabled (key format: "name@claude-plugins-official")
    const enabledKey = `${entry.name}@claude-plugins-official`;
    const enabled = enabledPlugins[enabledKey] === true;

    results.push({
      id: entry.name,
      name,
      description,
      category,
      hasMcp,
      mcpServerNames,
      enabled,
      isSymlink: false,
    });
  }

  return results;
}

export function scanPluginsFromDir(baseDir: string): PluginInfo[] {
  let enabledPlugins: Record<string, boolean> = {};
  const settingsFile = join(baseDir, "settings.json");
  if (existsSync(settingsFile)) {
    try {
      const s = JSON.parse(readFileSync(settingsFile, "utf-8"));
      if (s.enabledPlugins) enabledPlugins = s.enabledPlugins;
    } catch {
      console.error(chalk.yellow("Warning: Could not read settings.json for enabled plugins"));
    }
  }

  const internal = scanPluginDir(baseDir, PluginCategory.Internal, enabledPlugins);
  const external = scanPluginDir(baseDir, PluginCategory.External, enabledPlugins);
  return [...internal, ...external].toSorted((a, b) => a.name.localeCompare(b.name));
}

export function listDefaultPlugins(): PluginInfo[] {
  return scanPluginsFromDir(getDefaultClaudeDir());
}

export function listInstancePlugins(configDir: string): PluginInfo[] {
  return scanPluginsFromDir(configDir);
}

// ── Symlink Detection ─────────────────────────────────────────────

export function isPluginsSymlinked(configDir: string): boolean {
  const pluginsPath = join(configDir, "plugins");
  const st = lstatSafe(pluginsPath);
  return st?.isSymbolicLink() ?? false;
}

/**
 * Check if an instance is in half-manual mode (directory exists as real dir,
 * but individual items inside may be symlinks).
 */
export function isHalfManualSync(configDir: string): boolean {
  for (const dir of SYNC_DIRS) {
    const dirPath = join(configDir, dir);
    if (!existsSync(dirPath)) continue;
    const st = lstatSafe(dirPath);
    if (st?.isDirectory() && !st.isSymbolicLink()) {
      // Check if any child is a symlink
      try {
        const entries = readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const entryPath = join(dirPath, entry.name);
          const entryStat = lstatSafe(entryPath);
          if (entryStat?.isSymbolicLink()) return true;
        }
      } catch { /* ignore */ }
    }
  }
  return false;
}

// ── Process Detection ─────────────────────────────────────────────

export function isClaudeCodeRunning(configDir: string): boolean {
  if (process.env.NODE_ENV === "test") return false;
  try {
    const { execSync } = require("node:child_process");
    const result = execSync(
      `ps aux | grep -c "CLAUDE_CONFIG_DIR=${configDir}" || true`,
      { encoding: "utf-8", timeout: 2000 },
    ).trim();
    return parseInt(result, 10) > 1;
  } catch {
    return false;
  }
}

// ── installed_plugins.json Management ─────────────────────────────

interface InstalledPluginEntry {
  scope: string;
  installPath: string;
  version: string;
  installedAt: string;
  lastUpdated: string;
  projectPath?: string;
  gitCommitSha?: string;
}

interface InstalledPluginsFile {
  version: number;
  plugins: Record<string, InstalledPluginEntry[]>;
}

function readInstalledPlugins(pluginsDir: string): InstalledPluginsFile {
  const filePath = join(pluginsDir, "installed_plugins.json");
  if (!existsSync(filePath)) {
    return { version: 2, plugins: {} };
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return { version: 2, plugins: {} };
  }
}

async function writeInstalledPlugins(pluginsDir: string, data: InstalledPluginsFile): Promise<void> {
  await writeJsonFileAtomic(join(pluginsDir, "installed_plugins.json"), data);
}

async function addPluginToInstalledPlugins(
  configDir: string,
  pluginId: string,
): Promise<void> {
  const pluginsDir = join(configDir, "plugins");
  const data = readInstalledPlugins(pluginsDir);
  const key = `${pluginId}@claude-plugins-official`;

  if (!data.plugins[key]) {
    data.plugins[key] = [];
  }

  const cachePath = join(configDir, MARKETPLACE_REL);
  const entry: InstalledPluginEntry = {
    scope: "user",
    installPath: cachePath,
    version: "1.0.0",
    installedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  data.plugins[key].push(entry);
  await writeInstalledPlugins(pluginsDir, data);
}

async function removePluginFromInstalledPlugins(
  configDir: string,
  pluginId: string,
): Promise<void> {
  const pluginsDir = join(configDir, "plugins");
  const data = readInstalledPlugins(pluginsDir);
  const key = `${pluginId}@claude-plugins-official`;
  delete data.plugins[key];
  await writeInstalledPlugins(pluginsDir, data);
}

// ── Disk Space Check ──────────────────────────────────────────────

function estimatePluginSize(pluginPath: string): number {
  let total = 0;
  try {
    for (const entry of readdirSync(pluginPath, { withFileTypes: true })) {
      const fullPath = join(pluginPath, entry.name);
      if (entry.isDirectory()) {
        total += estimatePluginSize(fullPath);
      } else {
        // Skip files that can't be stat'd; return partial total
        try { total += statSync(fullPath).size; } catch {}
      }
    }
  // Return 0 if directory can't be read; caller uses this as an estimate
  } catch {}
  return total;
}

// ── MCP Collision Detection ───────────────────────────────────────

export function detectMcpCollisions(
  configDir: string,
  newPluginIds: string[],
): Array<{ serverName: string; existingSource: string; newSource: string }> {
  const existingServers = getMcpServersFromPlugins(configDir);
  const collisions: Array<{ serverName: string; existingSource: string; newSource: string }> = [];
  const defaultDir = getDefaultClaudeDir();

  for (const pluginId of newPluginIds) {
    for (const subDir of ["plugins", "external_plugins"]) {
      const mcpFile = join(defaultDir, MARKETPLACE_REL, subDir, pluginId, ".mcp.json");
      if (!existsSync(mcpFile)) continue;
      const newServers = readMcpJsonFile(mcpFile);
      for (const name of Object.keys(newServers)) {
        if (existingServers[name]) {
          collisions.push({
            serverName: name,
            existingSource: "installed plugin",
            newSource: pluginId,
          });
        }
      }
    }
  }

  return collisions;
}

// ── Individual Plugin Copy / Remove ───────────────────────────────

export interface ValidationResult {
  canProceed: boolean;
  errors: string[];
  warnings: string[];
}

export function validatePluginOperation(
  configDir: string,
  operation: PluginAction,
  pluginId?: string,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(configDir)) {
    errors.push("Instance config directory does not exist");
  }

  if (existsSync(configDir) && isPluginsSymlinked(configDir)) {
    errors.push("Plugins directory is symlinked (auto-sync). Disable auto-sync first.");
  }

  if (existsSync(configDir) && !isPluginsSymlinked(configDir) && isHalfManualSync(configDir)) {
    errors.push("Plugins are individually symlinked (half-manual). Switch to full-manual first to manage individual plugins.");
  }

  if (operation === PluginAction.Install && pluginId) {
    const defaults = listDefaultPlugins();
    if (!defaults.find(p => p.id === pluginId)) {
      errors.push(`Plugin '${pluginId}' not found in default installation`);
    }
  }

  if (operation === PluginAction.Remove && pluginId) {
    const installed = listInstancePlugins(configDir);
    if (!installed.find(p => p.id === pluginId)) {
      errors.push(`Plugin '${pluginId}' not installed in this instance`);
    }
  }

  if (operation === PluginAction.Install && pluginId && existsSync(configDir)) {
    const collisions = detectMcpCollisions(configDir, [pluginId]);
    for (const c of collisions) {
      warnings.push(`MCP server name collision: '${c.serverName}'`);
    }
  }

  return { canProceed: errors.length === 0, errors, warnings };
}

export async function copySinglePlugin(
  targetConfigDir: string,
  pluginId: string,
  category: PluginCategory,
): Promise<void> {
  const defaultDir = getDefaultClaudeDir();
  const subDir = category === PluginCategory.Internal ? "plugins" : "external_plugins";
  const sourcePlugin = join(defaultDir, MARKETPLACE_REL, subDir, pluginId);
  const targetPlugin = join(targetConfigDir, MARKETPLACE_REL, subDir, pluginId);

  if (!existsSync(sourcePlugin)) {
    throw new ClaudeMultiError(ErrorCode.PLUGIN_NOT_FOUND, `Plugin '${pluginId}' not found in default Claude`);
  }

  // Ensure scaffolding exists
  const scaffoldDir = join(targetConfigDir, MARKETPLACE_REL, subDir);
  if (!existsSync(scaffoldDir)) {
    await mkdir(scaffoldDir, { recursive: true });
  }

  const marketplaceDir = join(targetConfigDir, MARKETPLACE_REL);
  if (!existsSync(marketplaceDir)) {
    await mkdir(marketplaceDir, { recursive: true });
  }
  for (const metaFile of ["known_marketplaces.json", "blocklist.json"]) {
    const src = join(defaultDir, MARKETPLACE_REL, metaFile);
    const tgt = join(marketplaceDir, metaFile);
    if (existsSync(src) && !existsSync(tgt)) {
      await copyFile(src, tgt);
    }
  }

  // Remove existing target if present
  if (existsSync(targetPlugin)) {
    rmSync(targetPlugin, { force: true, recursive: true });
  }

  await copyDirRecursive(sourcePlugin, targetPlugin);

  // Update installed_plugins.json
  await addPluginToInstalledPlugins(targetConfigDir, pluginId);
}

export async function copySelectedPlugins(
  targetConfigDir: string,
  selections: Array<{ id: string; category: PluginCategory }>,
): Promise<void> {
  if (selections.length === 0) {
    throw new ClaudeMultiError(ErrorCode.NO_PLUGINS_SELECTED, "No plugins selected. Select at least one plugin.");
  }

  if (isPluginsSymlinked(targetConfigDir)) {
    throw new ClaudeMultiError(ErrorCode.SYMLINK_CONFLICT, "Cannot copy individual plugins to a symlinked instance. Disable auto-sync first.");
  }

  if (isClaudeCodeRunning(targetConfigDir)) {
    throw new ClaudeMultiError(ErrorCode.INSTANCE_RUNNING, "Claude Code is running on this instance. Close it first before modifying plugins.");
  }

  // Pre-flight: check all sources exist
  const defaultDir = getDefaultClaudeDir();
  for (const sel of selections) {
    const subDir = sel.category === PluginCategory.Internal ? "plugins" : "external_plugins";
    const source = join(defaultDir, MARKETPLACE_REL, subDir, sel.id);
    if (!existsSync(source)) {
      throw new ClaudeMultiError(ErrorCode.PLUGIN_NOT_FOUND, `Plugin '${sel.id}' not found in default Claude`);
    }
  }

  // Pre-flight: check disk space (estimate)
  let totalSize = 0;
  for (const sel of selections) {
    const subDir = sel.category === PluginCategory.Internal ? "plugins" : "external_plugins";
    totalSize += estimatePluginSize(join(defaultDir, MARKETPLACE_REL, subDir, sel.id));
  }
  // Warn if >100MB but don't block (exact free space check is platform-dependent)
  if (totalSize > 100 * 1024 * 1024) {
    throw new ClaudeMultiError(ErrorCode.PLUGIN_TOO_LARGE, `Selected plugins total ${(totalSize / 1024 / 1024).toFixed(1)}MB. Ensure sufficient disk space.`);
  }

  // Rollback journal
  const completed: Array<{ id: string; category: PluginCategory }> = [];

  try {
    for (const sel of selections) {
      // eslint-disable-next-line @react-doctor/async-await-in-loop -- rollback needs ordered completion tracking
      await copySinglePlugin(targetConfigDir, sel.id, sel.category);
      completed.push(sel);
    }
  } catch (err: unknown) {
    // Rollback completed copies
    for (const done of completed) {
      // eslint-disable-next-line @react-doctor/async-await-in-loop -- rollback needs ordered completion tracking
      try {
        const subDir = done.category === PluginCategory.Internal ? "plugins" : "external_plugins";
        const targetPath = join(targetConfigDir, MARKETPLACE_REL, subDir, done.id);
        if (existsSync(targetPath)) {
          rmSync(targetPath, { force: true, recursive: true });
        }
        await removePluginFromInstalledPlugins(targetConfigDir, done.id);
      } catch {
        console.error(chalk.yellow("Warning: could not clean up backup"));
      }
    }
    throw new ClaudeMultiError(ErrorCode.PLUGIN_INSTALL_FAILED, `Plugin install failed, rolled back ${completed.length} plugin(s). ${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }
}

export async function removeSinglePlugin(
  configDir: string,
  pluginId: string,
  category: PluginCategory,
): Promise<void> {
  if (isPluginsSymlinked(configDir)) {
    throw new ClaudeMultiError(ErrorCode.SYMLINK_CONFLICT, "Cannot remove plugins from a symlinked instance. Disable auto-sync first.");
  }

  const subDir = category === PluginCategory.Internal ? "plugins" : "external_plugins";
  const pluginPath = join(configDir, MARKETPLACE_REL, subDir, pluginId);

  if (!existsSync(pluginPath)) {
    throw new ClaudeMultiError(ErrorCode.PLUGIN_NOT_FOUND, `Plugin '${pluginId}' not found in this instance`);
  }

  // Backup before removal (in case we need to restore)
  const backupPath = pluginPath + ".removing";
  try {
    renameSync(pluginPath, backupPath);
  } catch (err: unknown) {
    throw new ClaudeMultiError(ErrorCode.PLUGIN_REMOVE_FAILED, `Failed to stage plugin for removal: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }

  try {
    rmSync(backupPath, { force: true, recursive: true });
    await removePluginFromInstalledPlugins(configDir, pluginId);
  } catch (err: unknown) {
    // Try to restore from backup
    try { renameSync(backupPath, pluginPath); } catch {
      console.error(chalk.red("Rollback attempt failed — backup may need manual recovery"));
    }
    throw new ClaudeMultiError(ErrorCode.PLUGIN_REMOVE_FAILED, `Failed to remove plugin: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }
}

// ── MCP Server Helpers ────────────────────────────────────────────

export function getMcpServersFromPlugins(configDir: string): Record<string, McpServer> {
  const result: Record<string, McpServer> = {};
  const basePlugins = join(configDir, MARKETPLACE_REL);

  for (const subDir of ["plugins", "external_plugins"]) {
    const dir = join(basePlugins, subDir);
    if (!existsSync(dir)) continue;

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const mcpFile = join(dir, entry.name, ".mcp.json");
      if (!existsSync(mcpFile)) continue;

      const servers = readMcpJsonFile(mcpFile);
      Object.assign(result, servers);
    }
  }

  return result;
}

export async function getInstanceMcpServers(configDir: string): Promise<{
  fromPlugins: Record<string, McpServer>;
  fromSettings: Record<string, McpServer>;
  all: Record<string, McpServer>;
}> {
  const fromPlugins = getMcpServersFromPlugins(configDir);
  const settings = await readClaudeSettings(configDir);
  const fromSettings = (settings?.mcpServers as Record<string, McpServer>) ?? {};
  const all: Record<string, McpServer> = { ...fromSettings, ...fromPlugins };
  return { fromPlugins, fromSettings, all };
}

export async function setCustomMcpServer(
  configDir: string,
  name: string,
  config: McpServer,
): Promise<void> {
  const settings = (await readClaudeSettings(configDir)) || {};
  if (!settings.mcpServers) settings.mcpServers = {};
  settings.mcpServers[name] = config;
  await writeClaudeSettings(configDir, settings);
}

export async function removeCustomMcpServer(
  configDir: string,
  name: string,
): Promise<void> {
  const settings = await readClaudeSettings(configDir);
  if (!settings?.mcpServers || !(name in settings.mcpServers)) return;
  delete settings.mcpServers[name];
  await writeClaudeSettings(configDir, settings);
}
