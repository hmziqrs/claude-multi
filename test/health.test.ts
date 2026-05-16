import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Instance } from "@/config";

const originalEnv = process.env.CLAUDE_MULTI_HOME;
let testDir: string;

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

      const issues = runHealthChecks([inst]);
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

      const issues = runHealthChecks([inst]);
      // Should only have the configDir missing issue, not binary or settings
      expect(issues.length).toBe(1);
      expect(issues[0]!.id).toBe("configdir-missing-test-inst");
    });

    test("handles empty instance list", async () => {
      const { runHealthChecks } = await import("@/health");
      const issues = runHealthChecks([]);
      expect(issues).toEqual([]);
    });

    test("issues have required fields", async () => {
      const { runHealthChecks } = await import("@/health");
      const inst = makeInstance({ configDir: join(testDir, "nonexistent") });

      const issues = runHealthChecks([inst]);
      for (const issue of issues) {
        expect(issue.id).toBeTruthy();
        expect(issue.severity).toMatch(/^(error|warning|info)$/);
        expect(issue.category).toMatch(/^(migration|config|symlink|binary|settings)$/);
        expect(issue.title).toBeTruthy();
        expect(issue.message).toBeTruthy();
        expect(issue.timestamp).toBeTruthy();
        expect(issue.dismissed).toBe(false);
        expect(issue.resolved).toBe(false);
        expect(issue.resolutionHint).toBeDefined();
      }
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
});
