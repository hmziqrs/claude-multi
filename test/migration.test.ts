import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Config } from "@/config";
import { getClaudeMultiVersion } from "@/version";
import { tryGetGlobalClaudePath, buildWrapperScript } from "@/wrapper";

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
      test("returns true when instanceMigrationVersion is behind and migrations exist", async () => {
        const { needsInstanceMigration } = await import("@/migration");
        const config = makeConfig({ instanceMigrationVersion: "0.1.0" });
        expect(needsInstanceMigration(config)).toBe(true);
      });

      test("returns true when instanceMigrationVersion is undefined", async () => {
        const { needsInstanceMigration } = await import("@/migration");
        const config = makeConfig();
        expect(needsInstanceMigration(config)).toBe(true);
      });

      test("returns false when instanceMigrationVersion is current", async () => {
        const { needsInstanceMigration } = await import("@/migration");
        const config = makeConfig({ instanceMigrationVersion: getClaudeMultiVersion() });
        expect(needsInstanceMigration(config)).toBe(false);
      });
    });

    describe("runInstanceMigrations", () => {
      test("skips wrapper regeneration for instances at current version", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });
        mkdirSync(join(testDir, "bin"), { recursive: true });

        const instDir = join(testDir, ".claude-skip-test");
        mkdirSync(instDir, { recursive: true });
        const binaryPath = join(testDir, "bin", "skip-test");

        // Write a wrapper that would NOT match generateWrapperScript
        writeFileSync(binaryPath, "#!/bin/sh\n# old wrapper\nexec /old/claude \"$@\"\n", { mode: 0o755 });

        const config = makeConfig({
          instanceMigrationVersion: "0.1.0",
          instances: [{
            name: "skip-test",
            configDir: instDir,
            binaryPath,
            createdAt: new Date().toISOString(),
            createdWithVersion: getClaudeMultiVersion(),
          }],
        });

        const result = await runInstanceMigrations(config);
        expect(result.instanceMigrationVersion).toBe(getClaudeMultiVersion());

        // Wrapper should NOT have been rewritten — instance is at current version
        const content = readFileSync(binaryPath, "utf-8");
        expect(content).toContain("/old/claude");
      });
    });

    describe("0.6.2 instance migration", () => {
      test("regenerates wrapper when content differs", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });
        mkdirSync(join(testDir, "bin"), { recursive: true });

        const instDir = join(testDir, ".claude-old");
        mkdirSync(instDir, { recursive: true });
        const binaryPath = join(testDir, "bin", "old");

        // Write a stale wrapper
        writeFileSync(binaryPath, `#!/bin/sh\nexport CLAUDE_CONFIG_DIR="/stale/path"\nexec "/stale/claude" "$@"\n`, { mode: 0o755 });

        const config = makeConfig({
          instanceMigrationVersion: "0.1.0",
          instances: [{
            name: "old",
            configDir: instDir,
            binaryPath,
            createdAt: new Date().toISOString(),
            createdWithVersion: "0.5.0",
          }],
        });

        const result = await runInstanceMigrations(config);
        expect(result.instanceMigrationVersion).toBe(getClaudeMultiVersion());

        const content = readFileSync(binaryPath, "utf-8");
        expect(content).toContain(`CLAUDE_CONFIG_DIR="${instDir}"`);
        expect(content).not.toContain("/stale/path");
      });

      test("uses global claude path, not pinned binary", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const claudePath = tryGetGlobalClaudePath();
        if (!claudePath) return; // Skip if claude not installed

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });
        mkdirSync(join(testDir, "bin"), { recursive: true });

        const instDir = join(testDir, ".claude-global");
        mkdirSync(instDir, { recursive: true });
        const binaryPath = join(testDir, "bin", "global");
        writeFileSync(binaryPath, "#!/bin/sh\nexec /old/claude \"$@\"\n", { mode: 0o755 });

        const config = makeConfig({
          instanceMigrationVersion: "0.1.0",
          instances: [{
            name: "global",
            configDir: instDir,
            binaryPath,
            createdAt: new Date().toISOString(),
            createdWithVersion: "0.5.0",
          }],
        });

        await runInstanceMigrations(config);

        const content = readFileSync(binaryPath, "utf-8");
        expect(content).toContain(`exec "${claudePath}"`);
      });

      test("does not regenerate wrapper when content is identical", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });
        mkdirSync(join(testDir, "bin"), { recursive: true });

        const instDir = join(testDir, ".claude-same");
        mkdirSync(instDir, { recursive: true });
        const binaryPath = join(testDir, "bin", "same");

        // Write the exact content the migration would produce (global claude path)
        const claudePath = tryGetGlobalClaudePath();
        if (!claudePath) return; // Skip if claude not installed
        const inst = { name: "same", configDir: instDir, binaryPath };
        const expectedContent = buildWrapperScript(inst, claudePath);
        writeFileSync(binaryPath, expectedContent, { mode: 0o755 });
        const mtimeBefore = statSync(binaryPath).mtimeMs;

        const config = makeConfig({
          instanceMigrationVersion: "0.1.0",
          instances: [{
            name: "same",
            configDir: instDir,
            binaryPath,
            createdAt: new Date().toISOString(),
            createdWithVersion: "0.5.0",
          }],
        });

        await runInstanceMigrations(config);

        // File should NOT have been rewritten
        const mtimeAfter = statSync(binaryPath).mtimeMs;
        expect(mtimeAfter).toBe(mtimeBefore);
        expect(readFileSync(binaryPath, "utf-8")).toBe(expectedContent);
      });

      test("handles missing wrapper file gracefully", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });

        const instDir = join(testDir, ".claude-nowrapper");
        mkdirSync(instDir, { recursive: true });

        const config = makeConfig({
          instanceMigrationVersion: "0.1.0",
          instances: [{
            name: "nowrapper",
            configDir: instDir,
            binaryPath: join(testDir, "bin", "nowrapper"),
            createdAt: new Date().toISOString(),
            createdWithVersion: "0.5.0",
          }],
        });

        const result = await runInstanceMigrations(config);
        expect(result.instanceMigrationVersion).toBe(getClaudeMultiVersion());
      });

      test("updates stale migrationVersion in .claude.json", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });
        mkdirSync(join(testDir, "bin"), { recursive: true });

        const instDir = join(testDir, ".claude-stale-json");
        mkdirSync(instDir, { recursive: true });
        writeFileSync(join(instDir, ".claude.json"), JSON.stringify({ migrationVersion: 10 }));

        const binaryPath = join(testDir, "bin", "stale-json");
        writeFileSync(binaryPath, "#!/bin/sh\nexec /claude \"$@\"\n", { mode: 0o755 });

        const config = makeConfig({
          instanceMigrationVersion: "0.1.0",
          instances: [{
            name: "stale-json",
            configDir: instDir,
            binaryPath,
            createdAt: new Date().toISOString(),
            createdWithVersion: "0.5.0",
          }],
        });

        await runInstanceMigrations(config);

        const claudeJson = JSON.parse(readFileSync(join(instDir, ".claude.json"), "utf-8"));
        expect(claudeJson.migrationVersion).toBe(13);
      });

      test("does not rewrite .claude.json when already at latest migrationVersion", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });
        mkdirSync(join(testDir, "bin"), { recursive: true });

        const instDir = join(testDir, ".claude-ok-json");
        mkdirSync(instDir, { recursive: true });
        writeFileSync(join(instDir, ".claude.json"), JSON.stringify({ migrationVersion: 13 }));

        const binaryPath = join(testDir, "bin", "ok-json");
        writeFileSync(binaryPath, "#!/bin/sh\nexec /claude \"$@\"\n", { mode: 0o755 });

        const config = makeConfig({
          instanceMigrationVersion: "0.1.0",
          instances: [{
            name: "ok-json",
            configDir: instDir,
            binaryPath,
            createdAt: new Date().toISOString(),
            createdWithVersion: "0.5.0",
          }],
        });

        await runInstanceMigrations(config);

        const content = readFileSync(join(instDir, ".claude.json"), "utf-8");
        expect(JSON.parse(content).migrationVersion).toBe(13);
      });

      test("fast path skips .claude.json update for current-version instance", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });
        mkdirSync(join(testDir, "bin"), { recursive: true });

        const instDir = join(testDir, ".claude-fastpath-json");
        mkdirSync(instDir, { recursive: true });
        // Intentionally stale .claude.json — fast path should skip updating this
        writeFileSync(join(instDir, ".claude.json"), JSON.stringify({ migrationVersion: 5 }));

        const binaryPath = join(testDir, "bin", "fastpath-json");
        writeFileSync(binaryPath, "#!/bin/sh\nexec /old/claude \"$@\"\n", { mode: 0o755 });

        const config = makeConfig({
          instanceMigrationVersion: "0.1.0",
          instances: [{
            name: "fastpath-json",
            configDir: instDir,
            binaryPath,
            createdAt: new Date().toISOString(),
            createdWithVersion: getClaudeMultiVersion(),
          }],
        });

        await runInstanceMigrations(config);

        // .claude.json should NOT have been updated — fast path applies
        const content = readFileSync(join(instDir, ".claude.json"), "utf-8");
        expect(JSON.parse(content).migrationVersion).toBe(5);

        // Wrapper should also NOT have been rewritten
        const wrapperContent = readFileSync(binaryPath, "utf-8");
        expect(wrapperContent).toContain("/old/claude");
      });

      test("handles multiple instances with mixed versions", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });
        mkdirSync(join(testDir, "bin"), { recursive: true });

        // Instance at current version — should be skipped
        const currentInstDir = join(testDir, ".claude-current-mix");
        mkdirSync(currentInstDir, { recursive: true });
        const currentBinaryPath = join(testDir, "bin", "current-mix");
        writeFileSync(currentBinaryPath, "#!/bin/sh\nexec /old/current \"$@\"\n", { mode: 0o755 });

        // Instance at old version — should be migrated
        const oldInstDir = join(testDir, ".claude-old-mix");
        mkdirSync(oldInstDir, { recursive: true });
        const oldBinaryPath = join(testDir, "bin", "old-mix");
        writeFileSync(oldBinaryPath, "#!/bin/sh\nexec /old/old \"$@\"\n", { mode: 0o755 });

        const config = makeConfig({
          instanceMigrationVersion: "0.1.0",
          instances: [
            {
              name: "current-mix",
              configDir: currentInstDir,
              binaryPath: currentBinaryPath,
              createdAt: new Date().toISOString(),
              createdWithVersion: getClaudeMultiVersion(),
            },
            {
              name: "old-mix",
              configDir: oldInstDir,
              binaryPath: oldBinaryPath,
              createdAt: new Date().toISOString(),
              createdWithVersion: "0.5.0",
            },
          ],
        });

        await runInstanceMigrations(config);

        // Current-version instance: wrapper NOT rewritten
        const currentContent = readFileSync(currentBinaryPath, "utf-8");
        expect(currentContent).toContain("/old/current");

        // Old-version instance: wrapper regenerated
        const oldContent = readFileSync(oldBinaryPath, "utf-8");
        expect(oldContent).not.toContain("/old/old");
        expect(oldContent).toContain(`CLAUDE_CONFIG_DIR="${oldInstDir}"`);
      });

      test("still updates .claude.json when wrapper is missing but instance is not at current version", async () => {
        const { runInstanceMigrations } = await import("@/migration");

        const cmDir = join(testDir, ".claude-multi");
        mkdirSync(cmDir, { recursive: true });

        const instDir = join(testDir, ".claude-no-wrapper-json");
        mkdirSync(instDir, { recursive: true });
        writeFileSync(join(instDir, ".claude.json"), JSON.stringify({ migrationVersion: 8 }));

        const config = makeConfig({
          instanceMigrationVersion: "0.1.0",
          instances: [{
            name: "no-wrapper-json",
            configDir: instDir,
            binaryPath: join(testDir, "bin", "no-wrapper-json"),
            createdAt: new Date().toISOString(),
            createdWithVersion: "0.5.0",
          }],
        });

        await runInstanceMigrations(config);

        // .claude.json should be updated even though wrapper doesn't exist
        const content = readFileSync(join(instDir, ".claude.json"), "utf-8");
        expect(JSON.parse(content).migrationVersion).toBe(13);
      });
    });
  });

  describe("loadConfig auto-backfill", () => {
    test("backfills createdWithVersion to legacy version for instances without it", async () => {
      const { LEGACY_INSTANCE_VERSION } = await import("@/migration");
      const { loadConfig, setTestConfigDir, clearTestConfigDir } = await import("@/config");

      mkdirSync(testDir, { recursive: true });

      // Write config with an instance missing createdWithVersion
      const config = {
        version: "2.0.0",
        instances: [{
          name: "old",
          configDir: join(testDir, ".claude-old"),
          binaryPath: join(testDir, "bin", "old"),
          createdAt: new Date().toISOString(),
        }],
      };
      writeFileSync(join(testDir, "config.json"), JSON.stringify(config));

      setTestConfigDir(testDir);
      try {
        const loaded = await loadConfig();
        expect(loaded.instances[0]!.createdWithVersion).toBe(LEGACY_INSTANCE_VERSION);
      } finally {
        clearTestConfigDir();
      }
    });

    test("preserves existing createdWithVersion values", async () => {
      const { loadConfig, setTestConfigDir, clearTestConfigDir } = await import("@/config");

      mkdirSync(testDir, { recursive: true });

      const config = {
        version: "2.0.0",
        instances: [{
          name: "new",
          configDir: join(testDir, ".claude-new"),
          binaryPath: join(testDir, "bin", "new"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.6.1",
        }],
      };
      writeFileSync(join(testDir, "config.json"), JSON.stringify(config));

      setTestConfigDir(testDir);
      try {
        const loaded = await loadConfig();
        expect(loaded.instances[0]!.createdWithVersion).toBe("0.6.1");
      } finally {
        clearTestConfigDir();
      }
    });
  });

  describe("0.6.3 instance migration — provider template sync", () => {
    test("updates MiMo model names to [1m] variants", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-mimo-sync");
      mkdirSync(instDir, { recursive: true });

      // Write settings with OLD MiMo config (no [1m], no thinking/output limits)
      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "sk-test-key-123",
          ANTHROPIC_BASE_URL: "https://api.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
          ANTHROPIC_SMALL_FAST_MODEL: "mimo-v2.5",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "mimo-sync",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "mimo-sync"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      expect(settings.env.ANTHROPIC_MODEL).toBe("mimo-v2.5-pro[1m]");
      expect(settings.env.ANTHROPIC_SMALL_FAST_MODEL).toBe("mimo-v2.5[1m]");
      expect(settings.env.ENABLE_THINKING).toBe("true");
      expect(settings.env.MAX_OUTPUT_TOKENS).toBe("128000");
    });

    test("preserves existing API key", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-key-preserve");
      mkdirSync(instDir, { recursive: true });

      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "sk-my-secret-key",
          ANTHROPIC_BASE_URL: "https://api.deepseek.com/anthropic",
          ANTHROPIC_MODEL: "deepseek-v4-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "key-preserve",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "key-preserve"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      expect(settings.env.ANTHROPIC_AUTH_TOKEN).toBe("sk-my-secret-key");
    });

    test("skips instance with unrecognized provider", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-custom");
      mkdirSync(instDir, { recursive: true });

      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "sk-test",
          ANTHROPIC_BASE_URL: "https://custom.api.com/anthropic",
          ANTHROPIC_MODEL: "custom-model",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "custom",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "custom"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      await runInstanceMigrations(config);

      // Should NOT be modified
      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      expect(settings.env.ANTHROPIC_MODEL).toBe("custom-model");
    });

    test("backfills providerTemplate field on detected instance", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-backfill");
      mkdirSync(instDir, { recursive: true });

      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "sk-test",
          ANTHROPIC_BASE_URL: "https://api.moonshot.ai/anthropic",
          ANTHROPIC_MODEL: "kimi-k2.5",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "backfill",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "backfill"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      const result = await runInstanceMigrations(config);
      expect(result.instances[0]!.providerTemplate).toBe("kimi");
    });

    test("skips instance without settings.json", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-no-settings");
      mkdirSync(instDir, { recursive: true });
      // No settings.json written

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "no-settings",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "no-settings"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      // Should not throw
      const result = await runInstanceMigrations(config);
      expect(result.instances[0]!.providerTemplate).toBeUndefined();
    });

    test("preserves mimo-token SGP base URL during migration", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-mimo-sgp");
      mkdirSync(instDir, { recursive: true });

      // Write settings with SGP region URL (should NOT be overwritten with cn)
      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "tp_test-sgp-key",
          ANTHROPIC_BASE_URL: "https://token-plan-sgp.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "mimo-sgp",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "mimo-sgp"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      // The SGP URL MUST be preserved — not overwritten with cn default
      expect(settings.env.ANTHROPIC_BASE_URL).toBe("https://token-plan-sgp.xiaomimimo.com/anthropic");
      // Template vars should still be updated
      expect(settings.env.ANTHROPIC_MODEL).toBe("mimo-v2.5-pro[1m]");
      // API key must survive
      expect(settings.env.ANTHROPIC_AUTH_TOKEN).toBe("tp_test-sgp-key");
    });

    test("preserves mimo-token AMS base URL during migration", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-mimo-ams");
      mkdirSync(instDir, { recursive: true });

      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "tp_test-ams-key",
          ANTHROPIC_BASE_URL: "https://token-plan-ams.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "mimo-ams",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "mimo-ams"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      expect(settings.env.ANTHROPIC_BASE_URL).toBe("https://token-plan-ams.xiaomimimo.com/anthropic");
      expect(settings.env.ANTHROPIC_MODEL).toBe("mimo-v2.5-pro[1m]");
      expect(settings.env.ANTHROPIC_AUTH_TOKEN).toBe("tp_test-ams-key");
    });

    test("keeps cn default URL for mimo-token without region override", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-mimo-cn");
      mkdirSync(instDir, { recursive: true });

      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "tp_test-cn-key",
          ANTHROPIC_BASE_URL: "https://token-plan-cn.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "mimo-cn",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "mimo-cn"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      expect(settings.env.ANTHROPIC_BASE_URL).toBe("https://token-plan-cn.xiaomimimo.com/anthropic");
      expect(settings.env.ANTHROPIC_MODEL).toBe("mimo-v2.5-pro[1m]");
    });

    test("backfills providerRegion from detected base URL", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-region-backfill");
      mkdirSync(instDir, { recursive: true });

      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "tp_test-key",
          ANTHROPIC_BASE_URL: "https://token-plan-sgp.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "region-backfill",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "region-backfill"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      const result = await runInstanceMigrations(config);
      expect(result.instances[0]!.providerRegion).toBe("sgp");
      expect(result.instances[0]!.providerTemplate).toBe("mimo-token");
    });

    test("uses stored providerRegion instead of detecting from URL", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-stored-region");
      mkdirSync(instDir, { recursive: true });

      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "tp_test-key",
          ANTHROPIC_BASE_URL: "https://token-plan-sgp.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "stored-region",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "stored-region"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
          providerTemplate: "mimo-token",
          providerRegion: "sgp",
        }],
      });

      const result = await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      // Should use the stored region (sgp), not fall back to cn
      expect(settings.env.ANTHROPIC_BASE_URL).toBe("https://token-plan-sgp.xiaomimimo.com/anthropic");
      // providerRegion should remain unchanged
      expect(result.instances[0]!.providerRegion).toBe("sgp");
    });

    test("detects region from URL over stale stored providerRegion (V03)", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-url-priority");
      mkdirSync(instDir, { recursive: true });

      // URL says ams, but stored providerRegion says sgp (stale)
      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "tp_test-key",
          ANTHROPIC_BASE_URL: "https://token-plan-ams.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "url-priority",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "url-priority"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
          providerTemplate: "mimo-token",
          providerRegion: "sgp", // stale — user manually changed URL to ams
        }],
      });

      const result = await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      // URL (ams) should win over stale stored region (sgp)
      expect(settings.env.ANTHROPIC_BASE_URL).toBe("https://token-plan-ams.xiaomimimo.com/anthropic");
      // providerRegion should be updated to match the actual URL
      expect(result.instances[0]!.providerRegion).toBe("ams");
    });

    test("handles trailing slash in base URL (V01)", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-trailing-slash");
      mkdirSync(instDir, { recursive: true });

      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "tp_test-key",
          ANTHROPIC_BASE_URL: "https://token-plan-sgp.xiaomimimo.com/anthropic/",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "trailing-slash",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "trailing-slash"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      // Should detect sgp from URL with trailing slash (URL gets normalized to canonical form)
      expect(settings.env.ANTHROPIC_BASE_URL).toBe("https://token-plan-sgp.xiaomimimo.com/anthropic");
    });

    test("preserves base URL when region is unrecognizable (V02/V04)", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-unknown-region");
      mkdirSync(instDir, { recursive: true });

      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "tp_test-key",
          ANTHROPIC_BASE_URL: "https://token-plan-custom.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "unknown-region",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "unknown-region"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
          providerTemplate: "mimo-token", // stored provider so detectProvider is bypassed
        }],
      });

      await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      // Custom URL should be preserved — NOT overwritten with cn default
      // (providerTemplate is set so the migration runs, but region detection fails,
      // triggering the fallback that preserves the existing base URL)
      expect(settings.env.ANTHROPIC_BASE_URL).toBe("https://token-plan-custom.xiaomimimo.com/anthropic");
      // Other template vars should still update
      expect(settings.env.ANTHROPIC_MODEL).toBe("mimo-v2.5-pro[1m]");
    });

    test("handles invalid stored providerRegion gracefully (V04)", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-invalid-region");
      mkdirSync(instDir, { recursive: true });

      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "tp_test-key",
          ANTHROPIC_BASE_URL: "https://token-plan-sgp.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "invalid-region",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "invalid-region"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
          providerTemplate: "mimo-token",
          providerRegion: "us", // invalid — not in MIMO_TOKEN_REGIONS
        }],
      });

      const result = await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      // Should detect sgp from actual URL (which is valid), ignore invalid stored region
      expect(settings.env.ANTHROPIC_BASE_URL).toBe("https://token-plan-sgp.xiaomimimo.com/anthropic");
      // providerRegion should be corrected to sgp
      expect(result.instances[0]!.providerRegion).toBe("sgp");
    });

    test("preserves user-customized tunable env vars (V05)", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-tunable");
      mkdirSync(instDir, { recursive: true });

      // User has customized MAX_OUTPUT_TOKENS and REASONING_EFFORT
      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "tp_test-key",
          ANTHROPIC_BASE_URL: "https://token-plan-sgp.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
          MAX_OUTPUT_TOKENS: "32000",
          REASONING_EFFORT: "low",
          ENABLE_THINKING: "false",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "tunable",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "tunable"),
          createdAt: new Date().toISOString(),
          createdWithVersion: "0.5.0",
        }],
      });

      await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      // User-customized tunable vars should be preserved
      expect(settings.env.MAX_OUTPUT_TOKENS).toBe("32000");
      expect(settings.env.REASONING_EFFORT).toBe("low");
      expect(settings.env.ENABLE_THINKING).toBe("false");
      // Model names should still be synced from template
      expect(settings.env.ANTHROPIC_MODEL).toBe("mimo-v2.5-pro[1m]");
    });

    test("v0.6.3 fast-path skips current-version instances (V11)", async () => {
      const { runInstanceMigrations } = await import("@/migration");

      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const instDir = join(testDir, ".claude-fastpath-063");
      mkdirSync(instDir, { recursive: true });

      // Settings with old model name — should NOT be updated
      writeFileSync(join(instDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "sk-test",
          ANTHROPIC_BASE_URL: "https://api.deepseek.com/anthropic",
          ANTHROPIC_MODEL: "deepseek-v4-pro",
        },
      }));

      const config = makeConfig({
        instanceMigrationVersion: "0.1.0",
        instances: [{
          name: "fastpath-063",
          configDir: instDir,
          binaryPath: join(testDir, "bin", "fastpath-063"),
          createdAt: new Date().toISOString(),
          createdWithVersion: getClaudeMultiVersion(),
        }],
      });

      await runInstanceMigrations(config);

      const settings = JSON.parse(readFileSync(join(instDir, "settings.json"), "utf-8"));
      // Should NOT be updated — instance is at current version, fast path applies
      expect(settings.env.ANTHROPIC_MODEL).toBe("deepseek-v4-pro");
    });

    test("getProviderByBaseUrl rejects unknown mimo-token region (V13)", async () => {
      const { getProviderByBaseUrl } = await import("@/templates");
      // URL with unknown region code should NOT match mimo-token
      expect(getProviderByBaseUrl("https://token-plan-evil.xiaomimimo.com/anthropic")).toBeNull();
    });
  });
});
