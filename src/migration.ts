import { existsSync, mkdirSync, readdirSync, copyFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import type { Config, MigrationMeta } from "./config.js";

export const CONFIG_VERSION = "2.0.0";

function getBaseDir() { return process.env.CLAUDE_MULTI_HOME || homedir(); }
function getBackupDir() { return join(getBaseDir(), ".claude-multi", "backups"); }
function getLockFile() { return join(getBaseDir(), ".claude-multi", ".migration.lock"); }

export interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  warnings: string[];
  error?: string;
}

function createLock(): boolean {
  const lockFile = getLockFile();
  const lockDir = dirname(lockFile);
  if (!existsSync(lockDir)) mkdirSync(lockDir, { recursive: true });
  if (existsSync(lockFile)) {
    try {
      const lock = JSON.parse(readFileSync(lockFile, "utf-8"));
      // Check if process is still alive
      try {
        process.kill(lock.pid, 0);
        return false; // Lock is active
      } catch {
        // Stale lock — remove it
        rmSync(lockFile, { force: true });
      }
    } catch {
      rmSync(lockFile, { force: true });
    }
  }
  writeFileSync(lockFile, JSON.stringify({
    pid: process.pid,
    startedAt: new Date().toISOString(),
  }), "utf-8");
  return true;
}

function releaseLock(): void {
  try { rmSync(getLockFile(), { force: true }); } catch {}
}

export function needsMigration(config: Config): boolean {
  if (config.migrationMeta?.migrationStatus === "failed") return false;
  return (config.version || "1.0.0") !== CONFIG_VERSION;
}

export function clearMigrationFailure(config: Config): Config {
  if (config.migrationMeta) {
    config.migrationMeta.migrationStatus = "pending";
    delete config.migrationMeta.failureInfo;
  }
  return config;
}

export async function createBackup(config: Config): Promise<string> {
  const backupDir = getBackupDir();
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = Math.random().toString(36).slice(2, 6);
  const fromV = config.version || "1.0.0";
  const backupPath = join(backupDir, `${ts}-${rand}-v${fromV}-to-v${CONFIG_VERSION}`);
  mkdirSync(backupPath, { recursive: true });

  // Copy config.json
  const configSrc = join(getBaseDir(), ".claude-multi", "config.json");
  if (existsSync(configSrc)) {
    copyFileSync(configSrc, join(backupPath, "config.json"));
  }

  // Copy each instance's settings.json
  const instancesDir = join(backupPath, "instances");
  for (const inst of config.instances) {
    const settingsFile = join(inst.configDir, "settings.json");
    if (existsSync(settingsFile)) {
      const instDir = join(instancesDir, inst.name);
      mkdirSync(instDir, { recursive: true });
      copyFileSync(settingsFile, join(instDir, "settings.json"));
    }
  }

  // Clean old backups (keep last 3)
  const backups = readdirSync(backupDir).sort();
  for (let i = 0; i < backups.length - 3; i++) {
    rmSync(join(backupDir, backups[i]!), { force: true, recursive: true });
  }

  return backupPath;
}

export async function runMigration(config: Config): Promise<Config> {
  if (!needsMigration(config)) return config;

  if (!createLock()) {
    return config; // Another process is migrating
  }

  const fromVersion = config.version || "1.0.0";
  const warnings: string[] = [];

  try {
    // Step 1: Create backup
    await createBackup(config);

    // Step 2: Validate instances
    for (const inst of config.instances) {
      if (!inst.name || !inst.configDir || !inst.binaryPath) {
        warnings.push(`Instance entry missing required fields, skipping: ${JSON.stringify(inst)}`);
      }
      if (inst.configDir && !existsSync(inst.configDir)) {
        warnings.push(`Instance '${inst.name}' configDir does not exist: ${inst.configDir}`);
      }
    }

    // Step 3: Apply transformation — just version bump + metadata
    config.version = CONFIG_VERSION;
    config.migrationMeta = {
      lastMigrationAt: new Date().toISOString(),
      migratedFromVersion: fromVersion,
      migrationStatus: "completed",
    };

    return config;
  } catch (err) {
    config.migrationMeta = {
      migrationStatus: "failed",
      lastMigrationAt: new Date().toISOString(),
      migratedFromVersion: fromVersion,
      failureInfo: {
        failedAt: new Date().toISOString(),
        error: (err as Error).message,
        step: "migration",
        canRetry: true,
      },
    };
    throw err;
  } finally {
    releaseLock();
  }
}

export function getMigrationStatus(config: Config): MigrationMeta | null {
  return config.migrationMeta ?? null;
}

export function listBackups(): string[] {
  const backupDir = getBackupDir();
  if (!existsSync(backupDir)) return [];
  return readdirSync(backupDir).sort().reverse();
}
