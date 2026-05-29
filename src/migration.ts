import { existsSync, mkdirSync, readdirSync, copyFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import type { Config, Instance, MigrationMeta } from "@/config";
import { getBaseDir } from "@/paths";
import { MigrationStatus } from "@/constants";

export const CONFIG_VERSION = "2.0.0";

export const INSTANCE_MIGRATION_VERSION = "1";
export const LEGACY_INSTANCE_VERSION = "0.5";

export interface InstanceMigration {
  version: string;
  description: string;
  migrate: (instance: Instance, config: Config) => Promise<Instance>;
}

const INSTANCE_MIGRATIONS: InstanceMigration[] = [
  {
    version: "1",
    description: "Backfill createdWithVersion on instances created before version tracking",
    migrate: async (instance) => {
      if (!instance.createdWithVersion) {
        return { ...instance, createdWithVersion: LEGACY_INSTANCE_VERSION };
      }
      return instance;
    },
  },
];

export function needsInstanceMigration(config: Config): boolean {
  const current = config.instanceMigrationVersion || "0";
  return INSTANCE_MIGRATIONS.some(m => m.version > current);
}

export async function runInstanceMigrations(config: Config): Promise<Config> {
  if (!needsInstanceMigration(config)) return config;

  if (!createLock()) return config;

  try {
    await createBackup(config);

    const currentVersion = config.instanceMigrationVersion || "0";
    const applicable = INSTANCE_MIGRATIONS
      .filter(m => m.version > currentVersion)
      .sort((a, b) => a.version.localeCompare(b.version));

    for (const migration of applicable) {
      for (let i = 0; i < config.instances.length; i++) {
        const migrated = await migration.migrate({ ...config.instances[i] }, config);
        config.instances[i] = migrated;
      }
    }

    config.instanceMigrationVersion = applicable[applicable.length - 1]?.version ?? currentVersion;
    return config;
  } finally {
    releaseLock();
  }
}

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
      const raw = JSON.parse(readFileSync(lockFile, "utf-8")) as unknown;
      if (typeof raw === "object" && raw !== null && "pid" in raw && typeof (raw as { pid: unknown }).pid === "number") {
        const lock = raw as { pid: number; startedAt: string };
        try {
          process.kill(lock.pid, 0);
          return false;
        } catch {
          rmSync(lockFile, { force: true });
        }
      } else {
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
  // Safe to silence — lock file may already be removed by another process
  try { rmSync(getLockFile(), { force: true }); } catch {}
}

export function needsMigration(config: Config): boolean {
  if (config.migrationMeta?.migrationStatus === MigrationStatus.Failed) return false;
  return (config.version || "1.0.0") !== CONFIG_VERSION;
}

export function clearMigrationFailure(config: Config): Config {
  if (config.migrationMeta) {
    config.migrationMeta.migrationStatus = MigrationStatus.Pending;
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
      migrationStatus: MigrationStatus.Completed,
    };

    return config;
  } catch (err: unknown) {
    config.migrationMeta = {
      migrationStatus: MigrationStatus.Failed,
      lastMigrationAt: new Date().toISOString(),
      migratedFromVersion: fromVersion,
      failureInfo: {
        failedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
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
