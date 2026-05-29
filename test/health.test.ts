import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Instance } from "@/config";
import { PINNED_CLAUDE_BIN } from "@/paths";
import { getClaudeMultiVersion } from "@/version";

const originalEnv = process.env.CLAUDE_MULTI_HOME;
let testDir: string;

const HAS_PINNED = existsSync(PINNED_CLAUDE_BIN);

function makeInstance(overrides: Partial<Instance> = {}): Instance {
  return {
    name: "test-inst",
    configDir: join(testDir, ".claude-test-inst"),
    binaryPath: join(testDir, "bin", "test-inst"),
    createdAt: new Date().toISOString(),
    autoSync: false,
    ...overrides,
  };
}

function writeShellWrapper(path: string, claudePath: string): void {
  writeFileSync(path, `#!/bin/sh
export CLAUDE_CONFIG_DIR="/fake"
exec "${claudePath}" "$@"
`, { mode: 0o755 });
}

function writeNodeWrapper(path: string, claudePath: string): void {
  writeFileSync(path, `#!/usr/bin/env node
import { spawn } from 'child_process';
process.env.CLAUDE_CONFIG_DIR = "/fake";
const claude = spawn("${claudePath}", process.argv.slice(2), { stdio: 'inherit', env: process.env });
claude.on('exit', (code) => { process.exit(code || 0); });
`, { mode: 0o755 });
}

describe("Health Check", () => {
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "health-test-"));
    process.env.CLAUDE_MULTI_HOME = testDir;
  });

  afterEach(() => {
    process.env.CLAUDE_MULTI_HOME = originalEnv;
    try { rmSync(testDir, { recursive: true, force: true }); } catch {}
  });

  describe("runHealthChecks", () => {
    test("returns empty for healthy instances", async () => {
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeFileSync(inst.binaryPath, "#!/bin/sh");
      writeFileSync(join(inst.configDir, "settings.json"), "{}");

      const issues = runHealthChecks([inst], undefined, getClaudeMultiVersion());
      expect(issues.length).toBe(0);
    });

    test("detects missing configDir", async () => {
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance({ configDir: join(testDir, "nonexistent") });

      const issues = runHealthChecks([inst]);
      const configIssue = issues.find(i => i.id === "configdir-missing-test-inst");
      expect(configIssue).toBeDefined();
      expect(configIssue!.severity).toBe("error");
      expect(configIssue!.category).toBe("config");
    });

    test("detects missing binary", async () => {
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });

      const issues = runHealthChecks([inst]);
      const binaryIssue = issues.find(i => i.id === "binary-missing-test-inst");
      expect(binaryIssue).toBeDefined();
      expect(binaryIssue!.severity).toBe("warning");
      expect(binaryIssue!.category).toBe("binary");
    });

    test("detects corrupted settings.json", async () => {
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });
      writeFileSync(join(inst.configDir, "settings.json"), "{invalid json");

      const issues = runHealthChecks([inst]);
      const settingsIssue = issues.find(i => i.id === "settings-corrupt-test-inst");
      expect(settingsIssue).toBeDefined();
      expect(settingsIssue!.severity).toBe("warning");
      expect(settingsIssue!.category).toBe("settings");
    });

    test("detects migration failure", async () => {
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });

      const issues = runHealthChecks([inst], {
        migrationStatus: "failed",
        failureInfo: { error: "test migration error" },
      });
      const migrationIssue = issues.find(i => i.id === "migration-failed");
      expect(migrationIssue).toBeDefined();
      expect(migrationIssue!.severity).toBe("error");
      expect(migrationIssue!.message).toContain("test migration error");
    });

    test("skips binary/settings check when configDir missing", async () => {
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance({ configDir: join(testDir, "nonexistent") });

      const issues = runHealthChecks([inst], undefined, getClaudeMultiVersion());
      expect(issues.length).toBe(1);
      expect(issues[0]!.id).toBe("configdir-missing-test-inst");
    });

    test("handles empty instance list", async () => {
      const { runHealthChecks } = await import("@/health");
      const issues = runHealthChecks([], undefined, getClaudeMultiVersion());
      expect(issues).toEqual([]);
    });

    test("issues have required fields", async () => {
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance({ configDir: join(testDir, "nonexistent") });

      const issues = runHealthChecks([inst]);
      for (const issue of issues) {
        expect(issue.id).toBeTruthy();
        expect(issue.severity).toMatch(/^(error|warning|info)$/);
        expect(issue.category).toMatch(/^(migration|config|symlink|binary|settings|version)$/);
        expect(issue.title).toBeTruthy();
        expect(issue.message).toBeTruthy();
        expect(issue.timestamp).toBeTruthy();
        expect(issue.dismissed).toBe(false);
        expect(issue.resolved).toBe(false);
        expect(issue.resolutionHint).toBeDefined();
      }
    });
  });

  describe("version detection", () => {
    test("detects shell wrapper pointing to wrong binary", async () => {
      if (!HAS_PINNED) return; // Skip if pinned bin not installed
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeShellWrapper(inst.binaryPath, "/usr/local/bin/claude");

      const issues = runHealthChecks([inst]);
      const versionIssue = issues.find(i => i.id === "wrong-claude-version-test-inst");
      expect(versionIssue).toBeDefined();
      expect(versionIssue!.severity).toBe("error");
      expect(versionIssue!.category).toBe("version");
      expect(versionIssue!.detail).toContain("/usr/local/bin/claude");
    });

    test("detects Node.js spawn wrapper pointing to wrong binary", async () => {
      if (!HAS_PINNED) return;
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeNodeWrapper(inst.binaryPath, "/usr/local/bin/claude");

      const issues = runHealthChecks([inst]);
      const versionIssue = issues.find(i => i.id === "wrong-claude-version-test-inst");
      expect(versionIssue).toBeDefined();
      expect(versionIssue!.severity).toBe("error");
      expect(versionIssue!.category).toBe("version");
      expect(versionIssue!.detail).toContain("/usr/local/bin/claude");
    });

    test("no version issue when wrapper points to pinned binary", async () => {
      if (!HAS_PINNED) return;
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeShellWrapper(inst.binaryPath, PINNED_CLAUDE_BIN);

      const issues = runHealthChecks([inst]);
      const versionIssue = issues.find(i => i.category === "version");
      expect(versionIssue).toBeUndefined();
    });

    test("no version issue when pinned binary does not exist", async () => {
      // This test only runs when the pinned bin does NOT exist
      if (HAS_PINNED) return;
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeShellWrapper(inst.binaryPath, "/usr/local/bin/claude");

      const issues = runHealthChecks([inst]);
      const versionIssue = issues.find(i => i.category === "version");
      expect(versionIssue).toBeUndefined();
    });
  });

  describe("fixWrapperVersions", () => {
    test("fixes shell wrapper pointing to wrong binary", async () => {
      if (!HAS_PINNED) return;
      const { fixWrapperVersions } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeShellWrapper(inst.binaryPath, "/usr/local/bin/claude");

      const fixed = fixWrapperVersions([inst]);
      expect(fixed).toEqual(["test-inst"]);

      const content = readFileSync(inst.binaryPath, "utf-8");
      expect(content).toContain(`exec "${PINNED_CLAUDE_BIN}"`);
      expect(content).toContain('CLAUDE_CONFIG_DIR="');
      expect(content).not.toContain("/usr/local/bin/claude");
    });

    test("fixes Node.js spawn wrapper by regenerating as shell", async () => {
      if (!HAS_PINNED) return;
      const { fixWrapperVersions } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeNodeWrapper(inst.binaryPath, "/usr/local/bin/claude");

      const fixed = fixWrapperVersions([inst]);
      expect(fixed).toEqual(["test-inst"]);

      const content = readFileSync(inst.binaryPath, "utf-8");
      expect(content).toContain("#!/bin/sh");
      expect(content).toContain(`exec "${PINNED_CLAUDE_BIN}"`);
      expect(content).not.toContain("spawn");
      expect(content).not.toContain("child_process");
    });

    test("preserves configDir in regenerated wrapper", async () => {
      if (!HAS_PINNED) return;
      const { fixWrapperVersions } = await import("@/health");
      const customConfigDir = join(testDir, ".claude-mycustom");
      const inst = makeInstance({ configDir: customConfigDir });
      mkdirSync(customConfigDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeNodeWrapper(inst.binaryPath, "/usr/local/bin/claude");

      const fixed = fixWrapperVersions([inst]);
      expect(fixed).toEqual(["test-inst"]);

      const content = readFileSync(inst.binaryPath, "utf-8");
      expect(content).toContain(`CLAUDE_CONFIG_DIR="${customConfigDir}"`);
    });

    test("skips wrapper already pointing to pinned binary", async () => {
      if (!HAS_PINNED) return;
      const { fixWrapperVersions } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeShellWrapper(inst.binaryPath, PINNED_CLAUDE_BIN);

      const fixed = fixWrapperVersions([inst]);
      expect(fixed).toEqual([]);
    });

    test("skips missing wrapper file", async () => {
      if (!HAS_PINNED) return;
      const { fixWrapperVersions } = await import("@/health");
      const inst = makeInstance();

      const fixed = fixWrapperVersions([inst]);
      expect(fixed).toEqual([]);
    });

    test("returns empty when pinned binary does not exist", async () => {
      if (HAS_PINNED) return; // Only run when pinned bin doesn't exist
      const { fixWrapperVersions } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeShellWrapper(inst.binaryPath, "/usr/local/bin/claude");

      const fixed = fixWrapperVersions([inst]);
      expect(fixed).toEqual([]);
    });

    test("fixes multiple instances", async () => {
      if (!HAS_PINNED) return;
      const { fixWrapperVersions } = await import("@/health");
      const inst1 = makeInstance({ name: "a", binaryPath: join(testDir, "bin", "a") });
      const inst2 = makeInstance({ name: "b", binaryPath: join(testDir, "bin", "b") });
      mkdirSync(inst1.configDir, { recursive: true });
      mkdirSync(inst2.configDir, { recursive: true });
      mkdirSync(join(testDir, "bin"), { recursive: true });
      writeShellWrapper(inst1.binaryPath, "/usr/local/bin/claude");
      writeNodeWrapper(inst2.binaryPath, "/other/claude");

      const fixed = fixWrapperVersions([inst1, inst2]);
      expect(fixed).toContain("a");
      expect(fixed).toContain("b");
      expect(fixed.length).toBe(2);
    });
  });

  describe("loadHealthStatus / saveHealthStatus", () => {
    test("returns empty status when no file", async () => {
      const { loadHealthStatus } = await import("@/health");
      const status = loadHealthStatus();
      expect(status.issues).toEqual([]);
      expect(status.lastChecked).toBe("");
    });

    test("round-trips status through save/load", async () => {
      const { loadHealthStatus, saveHealthStatus } = await import("@/health");
      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      const status = {
        lastChecked: new Date().toISOString(),
        issues: [{
          id: "test-issue",
          severity: "warning" as const,
          category: "config" as const,
          title: "Test",
          message: "Test issue",
          detail: null,
          instanceName: null,
          timestamp: new Date().toISOString(),
          dismissed: false,
          resolved: false,
          resolutionHint: null,
        }],
      };

      saveHealthStatus(status);
      const loaded = loadHealthStatus();
      expect(loaded.issues.length).toBe(1);
      expect(loaded.issues[0]!.id).toBe("test-issue");
    });

    test("handles corrupted health file", async () => {
      const { loadHealthStatus } = await import("@/health");
      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });
      writeFileSync(join(cmDir, "health-status.json"), "not json");

      const status = loadHealthStatus();
      expect(status.issues).toEqual([]);
    });
  });

  describe("dismissIssue / dismissAllIssues", () => {
    test("dismissIssue marks a single issue", async () => {
      const { saveHealthStatus, dismissIssue, loadHealthStatus } = await import("@/health");
      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      saveHealthStatus({
        lastChecked: new Date().toISOString(),
        issues: [
          { id: "a", severity: "warning", category: "config", title: "A", message: "A", detail: null, instanceName: null, timestamp: new Date().toISOString(), dismissed: false, resolved: false, resolutionHint: null },
          { id: "b", severity: "error", category: "binary", title: "B", message: "B", detail: null, instanceName: null, timestamp: new Date().toISOString(), dismissed: false, resolved: false, resolutionHint: null },
        ],
      });

      dismissIssue("a");

      const status = loadHealthStatus();
      expect(status.issues.find(i => i.id === "a")!.dismissed).toBe(true);
      expect(status.issues.find(i => i.id === "b")!.dismissed).toBe(false);
    });

    test("dismissAllIssues marks all issues", async () => {
      const { saveHealthStatus, dismissAllIssues, loadHealthStatus } = await import("@/health");
      const cmDir = join(testDir, ".claude-multi");
      mkdirSync(cmDir, { recursive: true });

      saveHealthStatus({
        lastChecked: new Date().toISOString(),
        issues: [
          { id: "a", severity: "warning", category: "config", title: "A", message: "A", detail: null, instanceName: null, timestamp: new Date().toISOString(), dismissed: false, resolved: false, resolutionHint: null },
          { id: "b", severity: "error", category: "binary", title: "B", message: "B", detail: null, instanceName: null, timestamp: new Date().toISOString(), dismissed: false, resolved: false, resolutionHint: null },
        ],
      });

      dismissAllIssues();

      const status = loadHealthStatus();
      for (const issue of status.issues) {
        expect(issue.dismissed).toBe(true);
      }
    });
  });

  describe("instance migration detection", () => {
    test("detects pending instance migrations when version is behind", async () => {
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });

      const issues = runHealthChecks([inst], undefined, "0.1.0");
      const pendingIssue = issues.find(i => i.id === "instance-migrations-pending");
      expect(pendingIssue).toBeDefined();
      expect(pendingIssue!.severity).toBe("warning");
      expect(pendingIssue!.category).toBe("migration");
    });

    test("no pending migration warning when version is current", async () => {
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance();
      mkdirSync(inst.configDir, { recursive: true });

      const issues = runHealthChecks([inst], undefined, getClaudeMultiVersion());
      const pendingIssue = issues.find(i => i.id === "instance-migrations-pending");
      expect(pendingIssue).toBeUndefined();
    });
  });
});
