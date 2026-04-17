import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Detects whether bun is available in PATH
 */
function hasBun(): boolean {
  try {
    execSync("which bun", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the package manager command to use (bun or npm)
 */
function getPM(): "bun" | "npm" {
  return hasBun() ? "bun" : "npm";
}

export interface VersionInfo {
  current: string | null;
  latest: string;
  updateAvailable: boolean;
}

export interface ClaudeMultiUpdateInfo {
  current: string;
  latest: string;
  updateAvailable: boolean;
}

/**
 * Gets the current version of claude-multi from package.json
 */
export function getClaudeMultiVersion(): string {
  const pkgPath = join(process.cwd(), "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  return pkg.version;
}

/**
 * Gets the latest version of claude-multi from npm registry
 */
export async function getLatestClaudeMultiVersion(): Promise<string> {
  const response = await fetch("https://registry.npmjs.org/claude-multi/latest");
  const data = await response.json();
  return data.version;
}

/**
 * Checks if a claude-multi update is available
 */
export async function checkForClaudeMultiUpdates(): Promise<ClaudeMultiUpdateInfo> {
  try {
    const current = getClaudeMultiVersion();
    const latest = await getLatestClaudeMultiVersion();
    return {
      current,
      latest,
      updateAvailable: current !== latest,
    };
  } catch {
    // On error, return no update available
    return { current: "", latest: "", updateAvailable: false };
  }
}

/**
 * Upgrades claude-multi to the latest version
 */
export function upgradeClaudeMulti(): void {
  const pm = getPM();
  if (pm === "bun") {
    execSync("bun upgrade -g claude-multi", { stdio: "inherit" });
  } else {
    execSync("npm update -g claude-multi", { stdio: "inherit" });
  }
}

/**
 * Gets the currently installed version of @anthropic-ai/claude-code
 */
export function getCurrentVersion(): string | null {
  const pm = getPM();
  try {
    const cmd = pm === "bun"
      ? "bun pm ls -g @anthropic-ai/claude-code --json"
      : "npm ls -g @anthropic-ai/claude-code --json";
    const output = execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const data = JSON.parse(output);
    const version =
      data.dependencies?.["@anthropic-ai/claude-code"]?.version;
    return version || null;
  } catch {
    return null;
  }
}

/**
 * Gets the latest version of @anthropic-ai/claude-code from npm registry
 */
export async function getLatestVersion(): Promise<string> {
  const pm = getPM();
  try {
    const cmd = pm === "bun"
      ? "bun pm npm view @anthropic-ai/claude-code version"
      : "npm view @anthropic-ai/claude-code version";
    const output = execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    return output.trim();
  } catch (error) {
    throw new Error(
      `Failed to fetch latest version from npm registry: ${error}`
    );
  }
}

/**
 * Checks if an update is available
 */
export async function checkForUpdates(): Promise<VersionInfo> {
  const current = getCurrentVersion();
  const latest = await getLatestVersion();

  return {
    current,
    latest,
    updateAvailable: current !== null && current !== latest,
  };
}

/**
 * Compares two semantic version strings
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }

  return 0;
}

/**
 * Updates @anthropic-ai/claude-code to the latest version
 */
export async function updateClaudeCode(): Promise<void> {
  const pm = getPM();
  try {
    console.log("Updating @anthropic-ai/claude-code...");
    const cmd = pm === "bun"
      ? "bun install -g @anthropic-ai/claude-code@latest"
      : "npm install -g @anthropic-ai/claude-code@latest";
    execSync(cmd, { stdio: "inherit" });
    console.log("Update completed successfully!");
  } catch (error) {
    throw new Error(`Failed to update @anthropic-ai/claude-code: ${error}`);
  }
}
