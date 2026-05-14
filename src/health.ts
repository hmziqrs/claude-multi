import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { detectBrokenSymlinks } from "./config.js";
import type { Instance } from "./config.js";

export type HealthSeverity = "error" | "warning" | "info";
export type HealthCategory = "migration" | "config" | "symlink" | "binary" | "settings";

export interface HealthIssue {
  id: string;
  severity: HealthSeverity;
  category: HealthCategory;
  title: string;
  message: string;
  detail: string | null;
  instanceName: string | null;
  timestamp: string;
  dismissed: boolean;
  resolved: boolean;
  resolutionHint: string | null;
}

export interface HealthStatus {
  lastChecked: string;
  issues: HealthIssue[];
}

const HEALTH_FILE = join(homedir(), ".claude-multi", "health-status.json");

export function runHealthChecks(
  instances: Instance[],
  migrationStatus?: { migrationStatus: string; failureInfo?: { error: string } } | null,
): HealthIssue[] {
  const now = new Date().toISOString();
  const issues: HealthIssue[] = [];

  // Check migration status
  if (migrationStatus?.migrationStatus === "failed") {
    issues.push({
      id: "migration-failed",
      severity: "error",
      category: "migration",
      title: "Migration failed",
      message: migrationStatus.failureInfo?.error ?? "Unknown migration error",
      detail: null,
      instanceName: null,
      timestamp: now,
      dismissed: false,
      resolved: false,
      resolutionHint: "Run 'claude-multi migrate --retry' or press ! from the home screen",
    });
  }

  // Per-instance checks
  for (const inst of instances) {
    // Config dir exists
    if (!existsSync(inst.configDir)) {
      issues.push({
        id: `configdir-missing-${inst.name}`,
        severity: "error",
        category: "config",
        title: "Config directory missing",
        message: `Instance '${inst.name}' configDir does not exist: ${inst.configDir}`,
        detail: inst.configDir,
        instanceName: inst.name,
        timestamp: now,
        dismissed: false,
        resolved: false,
        resolutionHint: "Remove this instance or recreate the directory",
      });
      continue;
    }

    // Binary exists
    if (!existsSync(inst.binaryPath)) {
      issues.push({
        id: `binary-missing-${inst.name}`,
        severity: "warning",
        category: "binary",
        title: "Binary not found",
        message: `Wrapper script missing: ${inst.binaryPath}`,
        detail: inst.binaryPath,
        instanceName: inst.name,
        timestamp: now,
        dismissed: false,
        resolved: false,
        resolutionHint: "Re-create the instance or run 'claude-multi sync'",
      });
    }

    // Settings.json parseable
    const settingsFile = join(inst.configDir, "settings.json");
    if (existsSync(settingsFile)) {
      try {
        JSON.parse(readFileSync(settingsFile, "utf-8"));
      } catch {
        issues.push({
          id: `settings-corrupt-${inst.name}`,
          severity: "warning",
          category: "settings",
          title: "Corrupted settings.json",
          message: `Instance '${inst.name}' has an invalid settings.json`,
          detail: settingsFile,
          instanceName: inst.name,
          timestamp: now,
          dismissed: false,
          resolved: false,
          resolutionHint: "Fix or delete the corrupted settings.json",
        });
      }
    }

    // Broken symlinks
    const symlinks = detectBrokenSymlinks(inst.configDir);
    if (symlinks.broken.length > 0) {
      issues.push({
        id: `broken-symlinks-${inst.name}`,
        severity: "warning",
        category: "symlink",
        title: "Broken symlinks",
        message: `Instance '${inst.name}' has broken symlinks: ${symlinks.broken.join(", ")}`,
        detail: symlinks.broken.join(", "),
        instanceName: inst.name,
        timestamp: now,
        dismissed: false,
        resolved: false,
        resolutionHint: "Re-sync symlinks from the home screen",
      });
    }
  }

  return issues;
}

export function loadHealthStatus(): HealthStatus {
  if (!existsSync(HEALTH_FILE)) {
    return { lastChecked: "", issues: [] };
  }
  try {
    return JSON.parse(readFileSync(HEALTH_FILE, "utf-8"));
  } catch {
    return { lastChecked: "", issues: [] };
  }
}

export function saveHealthStatus(status: HealthStatus): void {
  const dir = join(homedir(), ".claude-multi");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(HEALTH_FILE, JSON.stringify(status, null, 2), "utf-8");
}

export function dismissIssue(id: string): void {
  const status = loadHealthStatus();
  const issue = status.issues.find(i => i.id === id);
  if (issue) {
    issue.dismissed = true;
    saveHealthStatus(status);
  }
}

export function dismissAllIssues(): void {
  const status = loadHealthStatus();
  for (const issue of status.issues) {
    issue.dismissed = true;
  }
  saveHealthStatus(status);
}
