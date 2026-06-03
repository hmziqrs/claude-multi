import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { detectBrokenSymlinks } from "@/config";
import type { Instance } from "@/config";
import { getBaseDir } from "@/paths";
import { MigrationStatus, SyncMode, type SyncMode as SyncModeType } from "@/constants";
import { getSyncMode, syncModeLabel } from "@/config";
import { getClaudeMultiVersion } from "@/version";
import { LEGACY_INSTANCE_VERSION } from "@/migration";
import { buildWrapperScript, tryGetClaudePath } from "@/wrapper";
import { providerHasRegions, detectRegionFromBaseUrl, getProviderRegions } from "@/templates";

export type HealthSeverity = "error" | "warning" | "info";
export type HealthCategory = "migration" | "config" | "symlink" | "binary" | "settings" | "version";

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

function getHealthFile() { return join(getBaseDir(), ".claude-multi", "health-status.json"); }

export function runHealthChecks(
  instances: Instance[],
  migrationStatus?: { migrationStatus: string; failureInfo?: { error: string } } | null,
  instanceMigrationVersion?: string,
): HealthIssue[] {
  const now = new Date().toISOString();
  const issues: HealthIssue[] = [];

  const currentVersion = getClaudeMultiVersion();

  // Check for pending instance migrations
  if (instanceMigrationVersion !== currentVersion) {
    issues.push({
      id: "instance-migrations-pending",
      severity: "warning",
      category: "migration",
      title: "Instance migrations pending",
      message: `Instance schema is v${instanceMigrationVersion || "0.0.0"}, current is v${currentVersion}`,
      detail: null,
      instanceName: null,
      timestamp: now,
      dismissed: false,
      resolved: false,
      resolutionHint: "Run 'claude-multi doctor fix' to migrate",
    });
  }

  // Check migration status
  if (migrationStatus?.migrationStatus === MigrationStatus.Failed) {
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
      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(readFileSync(settingsFile, "utf-8")) as Record<string, unknown>;
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

      // Region consistency check for regional providers
      if (parsed && inst.providerTemplate && providerHasRegions(inst.providerTemplate)) {
        const env = parsed.env as Record<string, string> | undefined;
        const actualUrl = env?.ANTHROPIC_BASE_URL;
        const actualRegion = actualUrl ? detectRegionFromBaseUrl(actualUrl) : null;

        if (inst.providerRegion && actualRegion && inst.providerRegion !== actualRegion) {
          const providerRegions = getProviderRegions(inst.providerTemplate);
          const expectedUrl = providerRegions?.[inst.providerRegion]?.baseUrl;
          issues.push({
            id: `region-mismatch-${inst.name}`,
            severity: "warning",
            category: "settings",
            title: "Region URL mismatch",
            message: `Instance '${inst.name}' stored region is ${inst.providerRegion} but base URL points to ${actualRegion}`,
            detail: `Stored region: ${inst.providerRegion} (${expectedUrl})\nActual URL: ${actualUrl}`,
            instanceName: inst.name,
            timestamp: now,
            dismissed: false,
            resolved: false,
            resolutionHint: `Edit settings.json to set ANTHROPIC_BASE_URL to ${expectedUrl}, or run 'claude-multi doctor fix'`,
          });
        }
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

    // Wrapper points to wrong Claude binary
    const expectedClaudePath = tryGetClaudePath();
    if (existsSync(inst.binaryPath) && expectedClaudePath) {
      try {
        const wrapperContent = readFileSync(inst.binaryPath, "utf-8");

        // Check shell format: exec "/path/to/claude"
        const shellMatch = wrapperContent.match(/exec\s+"([^"]+)"/);
        // Check Windows .cmd format: "/path/to/claude" %*
        const cmdMatch = wrapperContent.match(/"([^"]+)"\s+%\*/);
        // Check Node.js format: spawn("/path/to/claude"
        const nodeMatch = wrapperContent.match(/spawn\("([^"]+)"/);

        const currentBin = shellMatch?.[1] ?? cmdMatch?.[1] ?? nodeMatch?.[1];
        if (currentBin && currentBin !== expectedClaudePath) {
          issues.push({
            id: `wrong-claude-version-${inst.name}`,
            severity: "error",
            category: "version",
            title: "Wrong Claude binary",
            message: `Instance '${inst.name}' uses a Claude version that may break 3rd-party providers`,
            detail: `Current: ${currentBin}\nExpected: ${expectedClaudePath}`,
            instanceName: inst.name,
            timestamp: now,
            dismissed: false,
            resolved: false,
            resolutionHint: "Run 'claude-multi doctor fix' or press ! from the home screen",
          });
        }
      } catch {
        // Can't read wrapper — skip
      }
    }

    // Instance on older version
    if (inst.createdWithVersion && inst.createdWithVersion !== LEGACY_INSTANCE_VERSION && inst.createdWithVersion !== currentVersion) {
      issues.push({
        id: `instance-outdated-${inst.name}`,
        severity: "info",
        category: "version",
        title: "Instance on older version",
        message: `Instance '${inst.name}' created with v${inst.createdWithVersion}, current is v${currentVersion}`,
        detail: null,
        instanceName: inst.name,
        timestamp: now,
        dismissed: false,
        resolved: false,
        resolutionHint: "Run 'claude-multi doctor fix' to migrate",
      });
    }
  }

  return issues;
}

export function loadHealthStatus(): HealthStatus {
  const healthFile = getHealthFile();
  if (!existsSync(healthFile)) {
    return { lastChecked: "", issues: [] };
  }
  try {
    return JSON.parse(readFileSync(healthFile, "utf-8"));
  } catch {
    return { lastChecked: "", issues: [] };
  }
}

/**
 * Atomically write the health status file using write-to-temp + rename.
 * Prevents corruption if the process crashes mid-write or if two
 * claude-multi instances write concurrently.
 */
export function saveHealthStatus(status: HealthStatus): void {
  const dir = join(getBaseDir(), ".claude-multi");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const healthFile = getHealthFile();
  const tmpPath = `${healthFile}.tmp.${randomBytes(4).toString("hex")}`;
  try {
    writeFileSync(tmpPath, JSON.stringify(status, null, 2), "utf-8");
    // Verify the temp file is valid JSON before committing
    JSON.parse(readFileSync(tmpPath, "utf-8"));
    renameSync(tmpPath, healthFile);
  } catch (err) {
    try { unlinkSync(tmpPath); } catch {}
    throw err;
  }
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

/**
 * Fix wrappers that point to the wrong Claude binary.
 * Regenerates them as shell scripts pointing to the resolved global Claude binary.
 * Returns the list of instance names that were fixed.
 */
export function fixWrapperVersions(instances: Instance[]): string[] {
  const expectedClaudePath = tryGetClaudePath();
  if (!expectedClaudePath) return [];

  const fixed: string[] = [];
  for (const inst of instances) {
    if (!existsSync(inst.binaryPath)) continue;

    try {
      const content = readFileSync(inst.binaryPath, "utf-8");

      // Check shell format
      const shellMatch = content.match(/exec\s+"([^"]+)"/);
      // Check Windows .cmd format
      const cmdMatch = content.match(/"([^"]+)"\s+%\*/);
      // Check Node.js format
      const nodeMatch = content.match(/spawn\("([^"]+)"/);

      const currentBin = shellMatch?.[1] ?? cmdMatch?.[1] ?? nodeMatch?.[1];
      if (!currentBin || currentBin === expectedClaudePath) continue;

      // Regenerate using canonical template, targeting resolved global binary
      const newContent = buildWrapperScript(inst, expectedClaudePath);

      // Only write if content actually differs
      if (content !== newContent) {
        writeFileSync(inst.binaryPath, newContent, { mode: 0o755 });
      }
      fixed.push(inst.name);
    } catch {
      // Skip unreadable wrappers
    }
  }
  return fixed;
}
