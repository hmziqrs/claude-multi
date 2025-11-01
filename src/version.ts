import { execSync } from "node:child_process";

export interface VersionInfo {
  current: string | null;
  latest: string;
  updateAvailable: boolean;
}

/**
 * Gets the currently installed version of @anthropic-ai/claude-code
 */
export function getCurrentVersion(): string | null {
  try {
    const output = execSync("npm list -g @anthropic-ai/claude-code --json", {
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
  try {
    const output = execSync(
      "npm view @anthropic-ai/claude-code version",
      {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      }
    );
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
  try {
    console.log("Updating @anthropic-ai/claude-code...");
    execSync("npm install -g @anthropic-ai/claude-code@latest", {
      stdio: "inherit",
    });
    console.log("Update completed successfully!");
  } catch (error) {
    throw new Error(`Failed to update @anthropic-ai/claude-code: ${error}`);
  }
}
