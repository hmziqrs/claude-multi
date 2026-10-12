import {
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  readFileSync,
  rmSync,
  writeFileSync,
  chmodSync,
} from "node:fs";
import { join, dirname } from "node:path";
import semver from "semver";
import type { Config, Instance, MigrationMeta } from "@/config";
import { getBaseDir } from "@/paths";
import { MigrationStatus } from "@/constants";
import { getClaudeMultiVersion } from "@/version";
import { tryGetClaudePath, buildWrapperScript } from "@/wrapper";
import { syncProviderEnvToSettings, needsProviderTemplateSync } from "@/templates";

export const CONFIG_VERSION = "2.0.0";

export const LEGACY_INSTANCE_VERSION = "0.5";

export interface InstanceMigration {
  version: string;
  description: string;
  migrate: (instance: Instance, config: Config) => Promise<Instance>;
}

const INSTANCE_MIGRATIONS: InstanceMigration[] = [
  {
    version: "0.6.2",
    description:
      "Regenerate wrappers and update stale .claude.json for current claude-multi behavior",
    // eslint-disable-next-line @react-doctor/require-await
    migrate: (instance) => {
      const currentVersion = getClaudeMultiVersion();

      if (
        instance.createdWithVersion &&
        instance.createdWithVersion !== LEGACY_INSTANCE_VERSION &&
        instance.createdWithVersion === currentVersion
      ) {
        return Promise.resolve(instance);
      }

      if (existsSync(instance.binaryPath)) {
        const claudePath = tryGetClaudePath();
        if (claudePath !== null) {
          const expected = buildWrapperScript(instance, claudePath);
          try {
            const current = readFileSync(instance.binaryPath, "utf-8");
            if (current !== expected) {
              writeFileSync(instance.binaryPath, expected, { mode: 0o755 });
              chmodSync(instance.binaryPath, 0o755);
            }
          } catch {}
        } else {
          console.warn(
            `[migration] Could not find claude binary, skipping wrapper regeneration for instance: ${instance.name}`,
          );
        }
      }

      updateClaudeJson(instance.configDir);

      return Promise.resolve(instance);
    },
  },
  {
    version: "0.6.3",
    description: "Sync provider template env vars (model names, thinking/output limits) to latest",
    // eslint-disable-next-line @react-doctor/require-await
    migrate: (instance) => {
      const currentVersion = getClaudeMultiVersion();
      if (
        instance.createdWithVersion &&
        instance.createdWithVersion !== LEGACY_INSTANCE_VERSION &&
        instance.createdWithVersion === currentVersion
      ) {
        return Promise.resolve(instance);
      }

      try {
        const result = syncProviderEnvToSettings(instance.configDir, {
          providerTemplate: instance.providerTemplate,
          providerRegion: instance.providerRegion,
          tunablePolicy: "preserve-custom",
        });

        if (result.status !== "skipped") {
          if (result.region) instance.providerRegion = result.region;
          if (!instance.providerTemplate && result.providerName) {
            instance.providerTemplate = result.providerName;
          }
        }
      } catch (err: unknown) {
        console.warn(
          `[migration] Failed to sync provider template for '${instance.name}': ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      return Promise.resolve(instance);
    },
  },
  {
    version: "0.11.1",
    description:
      "Sync provider env to current templates: model slots always updated; tunable vars refreshed when holding a known legacy default (e.g. GLM MAX_OUTPUT_TOKENS 64000)",
    // eslint-disable-next-line @react-doctor/require-await
    migrate: (instance) => {
      const currentVersion = getClaudeMultiVersion();
      if (
        instance.createdWithVersion &&
        instance.createdWithVersion !== LEGACY_INSTANCE_VERSION &&
        instance.createdWithVersion === currentVersion
      ) {
        return Promise.resolve(instance);
      }

      try {
        const result = syncProviderEnvToSettings(instance.configDir, {
          providerTemplate: instance.providerTemplate,
          providerRegion: instance.providerRegion,
          tunablePolicy: "overwrite-legacy-defaults",
        });

        if (result.status !== "skipped") {
          if (result.region) instance.providerRegion = result.region;
          if (!instance.providerTemplate && result.providerName) {
            instance.providerTemplate = result.providerName;
          }
        }
      } catch (err: unknown) {
        console.warn(
          `[migration] Failed to refresh provider env for '${instance.name}': ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      return Promise.resolve(instance);
    },
  },
  {
    version: "0.12.0",
    description:
      "GLM template: sonnet slot moved to glm-5.3-flash[1m] (three-tier split: opus glm-5.3[1m], sonnet glm-5.3-flash[1m], haiku glm-5-turbo)",
    // eslint-disable-next-line @react-doctor/require-await
    migrate: (instance) => {
      const currentVersion = getClaudeMultiVersion();
      if (
        instance.createdWithVersion &&
        instance.createdWithVersion !== LEGACY_INSTANCE_VERSION &&
        instance.createdWithVersion === currentVersion
      ) {
        return Promise.resolve(instance);
      }

      try {
        const result = syncProviderEnvToSettings(instance.configDir, {
          providerTemplate: instance.providerTemplate,
          providerRegion: instance.providerRegion,
          tunablePolicy: "overwrite-legacy-defaults",
        });

        if (result.status !== "skipped") {
          if (result.region) instance.providerRegion = result.region;
          if (!instance.providerTemplate && result.providerName) {
            instance.providerTemplate = result.providerName;
          }
        }
      } catch (err: unknown) {
        console.warn(
          `[migration] Failed to refresh provider env for '${instance.name}': ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      return Promise.resolve(instance);
    },
  },
];

function updateClaudeJson(configDir: string): void {
  const stateFile = join(configDir, ".claude.json");
  if (!existsSync(stateFile)) return;

  try {
    const raw = JSON.parse(readFileSync(stateFile, "utf-8")) as Record<string, unknown>;

    let changed = false;

    if (typeof raw.migrationVersion === "number" && raw.migrationVersion < 13) {
      raw.migrationVersion = 13;
      changed = true;
    }

    if (changed) {
      writeFileSync(stateFile, JSON.stringify(raw, null, 2), "utf-8");
    }
  } catch {}
}

export function needsInstanceMigration(config: Config): boolean {
  const current = getClaudeMultiVersion();
  const stored = config.instanceMigrationVersion;
  const providerTemplateDrift = config.instances.some((instance) =>
    needsProviderTemplateSync(instance.configDir, {
      providerTemplate: instance.providerTemplate,
      providerRegion: instance.providerRegion,
    }),
  );

  if (!stored) return INSTANCE_MIGRATIONS.length > 0 || providerTemplateDrift;
  const storedCoerced = semver.coerce(stored);
  if (!storedCoerced) return INSTANCE_MIGRATIONS.length > 0 || providerTemplateDrift;
  return (
    providerTemplateDrift ||
    INSTANCE_MIGRATIONS.some(
      (m) => semver.gt(m.version, storedCoerced) && semver.lte(m.version, current),
    )
  );
}

export async function runInstanceMigrations(config: Config): Promise<Config> {
  if (!needsInstanceMigration(config)) {
    const currentVersion = getClaudeMultiVersion();
    const storedCoerced = semver.coerce(config.instanceMigrationVersion ?? "");
    if (!storedCoerced || semver.lt(storedCoerced, currentVersion)) {
      config.instanceMigrationVersion = currentVersion;
    }
    return config;
  }

  if (!createLock()) return config;

  try {
    createBackup(config);

    const currentVersion = getClaudeMultiVersion();
    const stored = semver.coerce(config.instanceMigrationVersion || "0.0.0");
    const applicable = INSTANCE_MIGRATIONS.filter((m) =>
      stored ? semver.gt(m.version, stored) && semver.lte(m.version, currentVersion) : true,
    ).toSorted((a, b) => semver.compare(a.version, b.version));

    for (const migration of applicable) {
      // eslint-disable-next-line @react-doctor/async-await-in-loop
      for (let i = 0; i < config.instances.length; i++) {
        // eslint-disable-next-line @react-doctor/async-await-in-loop
        const migrated = await migration.migrate({ ...config.instances[i] } as Instance, config);
        config.instances[i] = migrated;
      }
    }

    for (let i = 0; i < config.instances.length; i++) {
      const instance = config.instances[i]!;
      if (
        !needsProviderTemplateSync(instance.configDir, {
          providerTemplate: instance.providerTemplate,
          providerRegion: instance.providerRegion,
        })
      )
        continue;

      try {
        const result = syncProviderEnvToSettings(instance.configDir, {
          providerTemplate: instance.providerTemplate,
          providerRegion: instance.providerRegion,
          tunablePolicy: "overwrite-legacy-defaults",
        });
        if (result.region) instance.providerRegion = result.region;
        if (!instance.providerTemplate && result.providerName)
          instance.providerTemplate = result.providerName;
      } catch (err: unknown) {
        console.warn(
          `[migration] Failed to refresh provider env for '${instance.name}': ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    config.instanceMigrationVersion = currentVersion;
    return config;
  } finally {
    releaseLock();
  }
}

function getBackupDir() {
  return join(getBaseDir(), ".claude-multi", "backups");
}
function getLockFile() {
  return join(getBaseDir(), ".claude-multi", ".migration.lock");
}

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
      if (
        typeof raw === "object" &&
        raw !== null &&
        "pid" in raw &&
        typeof (raw as { pid: unknown }).pid === "number"
      ) {
        const lock = raw as { pid: number; startedAt: string };
        const lockAge = Date.now() - new Date(lock.startedAt).getTime();
        if (lockAge > 30 * 60 * 1000) {
          rmSync(lockFile, { force: true });
        } else {
          try {
            process.kill(lock.pid, 0);
            return false;
          } catch {
            rmSync(lockFile, { force: true });
          }
        }
      } else {
        rmSync(lockFile, { force: true });
      }
    } catch {
      rmSync(lockFile, { force: true });
    }
  }
  writeFileSync(
    lockFile,
    JSON.stringify({
      pid: process.pid,
      startedAt: new Date().toISOString(),
    }),
    "utf-8",
  );
  return true;
}

function releaseLock(): void {
  try {
    rmSync(getLockFile(), { force: true });
  } catch {}
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

export function createBackup(config: Config): string {
  const backupDir = getBackupDir();
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = Math.random().toString(36).slice(2, 6);
  const fromV = config.version || "1.0.0";
  const backupPath = join(backupDir, `${ts}-${rand}-v${fromV}-to-v${CONFIG_VERSION}`);
  mkdirSync(backupPath, { recursive: true });

  const configSrc = join(getBaseDir(), ".claude-multi", "config.json");
  if (existsSync(configSrc)) {
    copyFileSync(configSrc, join(backupPath, "config.json"));
  }

  const instancesDir = join(backupPath, "instances");
  for (const inst of config.instances) {
    const settingsFile = join(inst.configDir, "settings.json");
    if (existsSync(settingsFile)) {
      const instDir = join(instancesDir, inst.name);
      mkdirSync(instDir, { recursive: true });
      copyFileSync(settingsFile, join(instDir, "settings.json"));
    }
  }

  const backups = readdirSync(backupDir).toSorted();
  for (let i = 0; i < backups.length - 3; i++) {
    rmSync(join(backupDir, backups[i]!), { force: true, recursive: true });
  }

  return backupPath;
}

export function runMigration(config: Config): Config {
  if (!needsMigration(config)) return config;

  if (!createLock()) {
    return config;
  }

  const fromVersion = config.version || "1.0.0";
  const warnings: string[] = [];

  try {
    createBackup(config);

    for (const inst of config.instances) {
      if (!inst.name || !inst.configDir || !inst.binaryPath) {
        warnings.push(`Instance entry missing required fields, skipping: ${JSON.stringify(inst)}`);
      }
      if (inst.configDir && !existsSync(inst.configDir)) {
        warnings.push(`Instance '${inst.name}' configDir does not exist: ${inst.configDir}`);
      }
    }

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
  return readdirSync(backupDir).toSorted().toReversed();
}
