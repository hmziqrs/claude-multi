import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Config } from "../src/config.js";

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
      const { needsMigration } = await import("../src/migration.js");
      const config = makeConfig();
      expect(needsMigration(config)).toBe(true);
    });

    test("returns false for v2 config", async () => {
      const { needsMigration, CONFIG_VERSION } = await import("../src/migration.js");
      const config = makeConfig({ version: CONFIG_VERSION });
      expect(needsMigration(config)).toBe(false);
    });

    test("returns false when migration previously failed", async () => {
      const { needsMigration } = await import("../src/migration.js");
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
      const { clearMigrationFailure } = await import("../src/migration.js");
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
      const { clearMigrationFailure } = await import("../src/migration.js");
      const config = makeConfig();
      const cleared = clearMigrationFailure(config);
      expect(cleared.migrationMeta).toBeUndefined();
    });
  });

  describe("runMigration", () => {
    test("upgrades v1 config to v2", async () => {
      const { runMigration, CONFIG_VERSION } = await import("../src/migration.js");
      const config = makeConfig();
      const result = await runMigration(config);
      expect(result.version).toBe(CONFIG_VERSION);
      expect(result.migrationMeta?.migrationStatus).toBe("completed");
      expect(result.migrationMeta?.migratedFromVersion).toBe("1.0.0");
    });

    test("skips when already at latest version", async () => {
      const { runMigration, CONFIG_VERSION } = await import("../src/migration.js");
      const config = makeConfig({ version: CONFIG_VERSION });
      const result = await runMigration(config);
      expect(result.version).toBe(CONFIG_VERSION);
    });

    test("creates backup before migration", async () => {
      const { runMigration } = await import("../src/migration.js");

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
      const { runMigration } = await import("../src/migration.js");

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
      const { runMigration } = await import("../src/migration.js");

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
      const { runMigration } = await import("../src/migration.js");

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
      const { getMigrationStatus } = await import("../src/migration.js");
      const config = makeConfig();
      expect(getMigrationStatus(config)).toBeNull();
    });

    test("returns metadata when present", async () => {
      const { getMigrationStatus } = await import("../src/migration.js");
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
      const { listBackups } = await import("../src/migration.js");
      expect(listBackups()).toEqual([]);
    });

    test("lists existing backups", async () => {
      const { listBackups, createBackup } = await import("../src/migration.js");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      await createBackup(makeConfig());
      await createBackup(makeConfig());

      const backups = listBackups();
      expect(backups.length).toBe(2);
    });

    test("keeps only last 3 backups", async () => {
      const { listBackups, createBackup } = await import("../src/migration.js");

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
      const { runMigration } = await import("../src/migration.js");

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
});
