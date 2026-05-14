import { existsSync, mkdirSync, readdirSync, copyFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import type { Config, MigrationMeta } from "./config.js";

export const CONFIG_VERSION = "2.0.0";

const BACKUP_DIR = join(homedir(), ".claude-multi", "backups");
const LOCK_FILE = join(homedir(), ".claude-multi", ".migration.lock");

export interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  warnings: string[];
  error?: string;
}

function createLock(): boolean {
  if (existsSync(LOCK_FILE)) {
    try {
      const lock = JSON.parse(readFileSync(LOCK_FILE, "utf-8"));
      // Check if process is still alive
      try {
        process.kill(lock.pid, 0);
        return false; // Lock is active
      } catch {
        // Stale lock — remove it
        rmSync(LOCK_FILE, { force: true });
      }
    } catch {
      rmSync(LOCK_FILE, { force: true });
    }
  }
  writeFileSync(LOCK_FILE, JSON.stringify({
    pid: process.pid,
    startedAt: new Date().toISOString(),
  }), "utf-8");
  return true;
}

function releaseLock(): void {
  try { rmSync(LOCK_FILE, { force: true }); } catch {}
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
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const fromV = config.version || "1.0.0";
  const backupPath = join(BACKUP_DIR, `${ts}-v${fromV}-to-v${CONFIG_VERSION}`);
  mkdirSync(backupPath, { recursive: true });

  // Copy config.json
  const configSrc = join(homedir(), ".claude-multi", "config.json");
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
  const backups = readdirSync(BACKUP_DIR).sort();
  for (let i = 0; i < backups.length - 3; i++) {
    rmSync(join(BACKUP_DIR, backups[i]!), { force: true, recursive: true });
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
  if (!existsSync(BACKUP_DIR)) return [];
  return readdirSync(BACKUP_DIR).sort().reverse();
}
