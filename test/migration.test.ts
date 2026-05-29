import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Config } from "@/config";
import { getClaudeMultiVersion } from "@/version";

const originalEnv = process.env.CLAUDE_MULTI_HOME;
let testDir: string;

function makeConfig(overrides: Partial<Config> = {}): Config {
  return {
    version: "1.0.0",
    instances: [],
    ...overrides,
  } as Config;
}

describe("Migration", () => {
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "migration-test-"));
    process.env.CLAUDE_MULTI_HOME = testDir;
  });

  afterEach(() => {
    process.env.CLAUDE_MULTI_HOME = originalEnv;
    try { rmSync(testDir, { recursive: true, force: true }); } catch {}
  });

  describe("needsMigration", () => {
    test("returns true for v1 config", async () => {
      const { needsMigration } = await import("@/migration");
      const config = makeConfig();
      expect(needsMigration(config)).toBe(true);
    });

    test("returns false for v2 config", async () => {
      const { needsMigration, CONFIG_VERSION } = await import("@/migration");
      const config = makeConfig({ version: CONFIG_VERSION });
      expect(needsMigration(config)).toBe(false);
    });

    test("returns false when migration previously failed", async () => {
      const { needsMigration } = await import("@/migration");
      const config = makeConfig({
        migrationMeta: {
          migrationStatus: "failed",
          lastMigrationAt: new Date().toISOString(),
          migratedFromVersion: "1.0.0",
          failureInfo: { failedAt: new Date().toISOString(), error: "test", step: "migration", canRetry: true },
        },
      });
      expect(needsMigration(config)).toBe(false);
    });
  });

  describe("clearMigrationFailure", () => {
    test("resets failed status to pending", async () => {
      const { clearMigrationFailure } = await import("@/migration");
      const config = makeConfig({
        migrationMeta: {
          migrationStatus: "failed",
          lastMigrationAt: new Date().toISOString(),
          migratedFromVersion: "1.0.0",
          failureInfo: { failedAt: new Date().toISOString(), error: "test", step: "migration", canRetry: true },
        },
      });
      const cleared = clearMigrationFailure(config);
      expect(cleared.migrationMeta!.migrationStatus).toBe("pending");
      expect(cleared.migrationMeta!.failureInfo).toBeUndefined();
    });

    test("no-ops when no migrationMeta", async () => {
      const { clearMigrationFailure } = await import("@/migration");
      const config = makeConfig();
      const cleared = clearMigrationFailure(config);
      expect(cleared.migrationMeta).toBeUndefined();
    });
  });

  describe("runMigration", () => {
    test("upgrades v1 config to v2", async () => {
      const { runMigration, CONFIG_VERSION } = await import("@/migration");
      const config = makeConfig();
      const result = await runMigration(config);
      expect(result.version).toBe(CONFIG_VERSION);
      expect(result.migrationMeta?.migrationStatus).toBe("completed");
      expect(result.migrationMeta?.migratedFromVersion).toBe("1.0.0");
    });

    test("skips when already at latest version", async () => {
      const { runMigration, CONFIG_VERSION } = await import("@/migration");
      const config = makeConfig({ version: CONFIG_VERSION });
      const result = await runMigration(config);
      expect(result.version).toBe(CONFIG_VERSION);
    });

    test("creates backup before migration", async () => {
      const { runMigration } = await import("@/migration");

      // Create a config.json to back up
      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });
      writeFileSync(join(cmDir, "config.json"), JSON.stringify(makeConfig()));

      const config = makeConfig();
      await runMigration(config);

      const backupDir = join(testDir, ".claude-multi", "backups");
      expect(existsSync(backupDir)).toBe(true);
      const backups = readdirSync(backupDir);
      expect(backups.length).toBe(1);
      expect(backups[0]).toContain("v1.0.0-to-v2.0.0");
    });

    test("backs up instance settings.json", async () => {
      const { runMigration } = await import("@/migration");

      // Create instance with settings
      const instDir = join(testDir, ".claude-testinst");
      mkdirSync(instDir, { recursive: true });
      writeFileSync(join(instDir, "settings.json"), JSON.stringify({ test: true }));

      // Create config.json
      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const config = makeConfig({
        instances: [{
          name: "testinst",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "testinst"),
          createdAt: new Date().toISOString(),
          autoSync: false,
        }],
      });
      writeFileSync(join(cmDir, "config.json"), JSON.stringify(config));

      await runMigration(config);

      const backupDir = join(cmDir, "backups");
      const backups = readdirSync(backupDir);
      const instBackup = join(backupDir, backups[0]!, "instances", "testinst", "settings.json");
      expect(existsSync(instBackup)).toBe(true);
    });

    test("warns about missing configDir", async () => {
      const { runMigration } = await import("@/migration");

      const config = makeConfig({
        instances: [{
          name: "ghost",
          configDir: join(testDir, "nonexistent"),
          binaryPath: join(testDir, "bin", "ghost"),
          createdAt: new Date().toISOString(),
          autoSync: false,
        }],
      });

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      // Should not throw
      const result = await runMigration(config);
      expect(result.migrationMeta?.migrationStatus).toBe("completed");
    });

    test("sets failure status on error", async () => {
      const { runMigration } = await import("@/migration");

      // Make backup dir unwritable to cause failure
      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });
      // Create backups dir as a file (will cause mkdirSync to fail)
      writeFileSync(join(cmDir, "backups"), "not a dir");

      const config = makeConfig();

      try {
        await runMigration(config);
        expect.unreachable("Should have thrown");
      } catch {
        expect(config.migrationMeta?.migrationStatus).toBe("failed");
        expect(config.migrationMeta?.failureInfo).toBeDefined();
        expect(config.migrationMeta?.failureInfo!.error).toBeDefined();
      }
    });
  });

  describe("getMigrationStatus", () => {
    test("returns null when no metadata", async () => {
      const { getMigrationStatus } = await import("@/migration");
      const config = makeConfig();
      expect(getMigrationStatus(config)).toBeNull();
    });

    test("returns metadata when present", async () => {
      const { getMigrationStatus } = await import("@/migration");
      const meta = {
        lastMigrationAt: new Date().toISOString(),
        migratedFromVersion: "1.0.0",
        migrationStatus: "completed" as const,
      };
      const config = makeConfig({ migrationMeta: meta });
      expect(getMigrationStatus(config)).toEqual(meta);
    });
  });

  describe("listBackups", () => {
    test("returns empty array when no backups", async () => {
      const { listBackups } = await import("@/migration");
      expect(listBackups()).toEqual([]);
    });

    test("lists existing backups", async () => {
      const { listBackups, createBackup } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      await createBackup(makeConfig());
      await createBackup(makeConfig());

      const backups = listBackups();
      expect(backups.length).toBe(2);
    });

    test("keeps only last 3 backups", async () => {
      const { listBackups, createBackup } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      for (let i = 0; i < 5; i++) {
        await createBackup(makeConfig());
      }

      const backups = listBackups();
      expect(backups.length).toBe(3);
    });
  });

  describe("Lock mechanism", () => {
    test("prevents concurrent migration", async () => {
      const { runMigration } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      // Create a lock file with current PID
      const lockFile = join(cmDir, ".migration.lock");
      writeFileSync(lockFile, JSON.stringify({
        pid: process.pid,
        startedAt: new Date().toISOString(),
      }));

      const config = makeConfig();
      // Should return config unchanged (lock active)
      const result = await runMigration(config);
      expect(result.version).toBe("1.0.0"); // Not migrated
    });
  });

  describe("Instance-level migrations", () => {
    describe("needsInstanceMigration", () => {
      test("returns true when no instanceMigrationVersion", async () => {
        const { needsInstanceMigration } = await import("@/migration");
        const config = makeConfig();
        expect(needsInstanceMigration(config)).toBe(true);
      });

      test("returns true when instanceMigrationVersion is behind", async () => {
        const { needsInstanceMigration } = await import("@/migration");
        const config = makeConfig({ instanceMigrationVersion: "0.1.0" });
        expect(needsInstanceMigration(config)).toBe(true);
      });

      test("returns false when instanceMigrationVersion is current", async () => {
        const { needsInstanceMigration } = await import("@/migration");
        const config = makeConfig({ instanceMigrationVersion: getClaudeMultiVersion() });
        expect(needsInstanceMigration(config)).toBe(false);
      });
    });

    describe("runInstanceMigrations", () => {
      test("backfills createdWithVersion on instances without it", async () => {
        const { runInstanceMigrations, LEGACY_INSTANCE_VERSION } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });

        const config = makeConfig({
          instances: [{
            name: "old-inst",
            configDir: join(testDir, ".claude-old"),
            binaryPath: join(testDir, "bin", "old"),
            createdAt: new Date().toISOString(),
          }],
        });

        const result = await runInstanceMigrations(config);
        expect(result.instances[0]!.createdWithVersion).toBe(LEGACY_INSTANCE_VERSION);
      });

      test("preserves existing createdWithVersion values", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });

        const config = makeConfig({
          instances: [{
            name: "new-inst",
            configDir: join(testDir, ".claude-new"),
            binaryPath: join(testDir, "bin", "new"),
            createdAt: new Date().toISOString(),
            createdWithVersion: "0.6.1",
          }],
        });

        const result = await runInstanceMigrations(config);
        expect(result.instances[0]!.createdWithVersion).toBe("0.6.1");
      });

      test("updates instanceMigrationVersion on success", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });

        const config = makeConfig();
        const result = await runInstanceMigrations(config);
        expect(result.instanceMigrationVersion).toBe(getClaudeMultiVersion());
      });

      test("is idempotent", async () => {
        const { runInstanceMigrations, LEGACY_INSTANCE_VERSION } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });

        const config = makeConfig({
          instances: [{
            name: "inst",
            configDir: join(testDir, ".claude-inst"),
            binaryPath: join(testDir, "bin", "inst"),
            createdAt: new Date().toISOString(),
          }],
        });

        const first = await runInstanceMigrations(config);
        const second = await runInstanceMigrations(first);
        expect(second.instanceMigrationVersion).toBe(getClaudeMultiVersion());
        expect(second.instances[0]!.createdWithVersion).toBe(LEGACY_INSTANCE_VERSION);
      });

      test("handles empty instances array", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });

        const config = makeConfig({ instances: [] });
        const result = await runInstanceMigrations(config);
        expect(result.instanceMigrationVersion).toBe(getClaudeMultiVersion());
        expect(result.instances).toHaveLength(0);
      });

      test("skips when lock is held", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });

        // Create a lock file with current PID
        const lockFile = join(cmDir, ".migration.lock");
        writeFileSync(lockFile, JSON.stringify({
          pid: process.pid,
          startedAt: new Date().toISOString(),
        }));

        const config = makeConfig({
          instances: [{
            name: "locked-inst",
            configDir: join(testDir, ".claude-locked"),
            binaryPath: join(testDir, "bin", "locked"),
            createdAt: new Date().toISOString(),
          }],
        });

        const result = await runInstanceMigrations(config);
        // Should return unchanged (lock active)
        expect(result.instanceMigrationVersion).toBeUndefined();
        expect(result.instances[0]!.createdWithVersion).toBeUndefined();
      });
    });
  });
});
