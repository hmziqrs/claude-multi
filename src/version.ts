import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ClaudeMultiError, ErrorCode } from "@/errors";
import { detectPackageManager } from "@/util/runtime";

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
  const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "..", "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as unknown;
  if (typeof pkg !== "object" || pkg === null || typeof (pkg as { version?: unknown }).version !== "string") {
    throw new ClaudeMultiError(ErrorCode.CONFIG_CORRUPTED, "Could not read package version");
  }
  return (pkg as { version: string }).version;
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
  const pm = detectPackageManager();
  const commands: Record<typeof pm, string> = {
    bun: "bun upgrade -g claude-multi",
    npm: "npm update -g claude-multi",
    pnpm: "pnpm update -g claude-multi",
    deno: "deno install --reload -g npm:claude-multi",
  };
  try {
    execSync(commands[pm], { stdio: "inherit" });
  } catch (err: unknown) {
    throw new ClaudeMultiError(
      ErrorCode.UPDATE_FAILED,
      `Failed to update claude-multi: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    );
  }
}

/**
 * Gets the currently installed version of @anthropic-ai/claude-code
 */
export function getCurrentVersion(): string | null {
  const pm = detectPackageManager();
  try {
    if (pm === 'deno') return null;

    const commands: Record<Exclude<typeof pm, 'deno'>, string> = {
      bun: "bun pm ls -g --json",
      npm: "npm ls -g --json @anthropic-ai/claude-code",
      pnpm: "pnpm ls -g --json",
    };
    const output = execSync(commands[pm as Exclude<typeof pm, 'deno'>], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const data = JSON.parse(output);
    // pnpm returns an array, npm/bun return an object
    const root = Array.isArray(data) ? data[0] : data;
    return root?.dependencies?.["@anthropic-ai/claude-code"]?.version ?? null;
  } catch {
    return null;
  }
}

/**
 * Gets the latest version of @anthropic-ai/claude-code from npm registry
 */
export async function getLatestVersion(): Promise<string> {
  try {
    const response = await fetch("https://registry.npmjs.org/@anthropic-ai/claude-code/latest");
    const data = await response.json() as { version: string };
    return data.version;
  } catch (err: unknown) {
    throw new ClaudeMultiError(ErrorCode.VERSION_CHECK_FAILED, `Failed to fetch latest version from npm registry: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
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
 * Updates @anthropic-ai/claude-code to the latest version
 */
export function updateClaudeCode(): void {
  const pm = detectPackageManager();
  const commands: Record<typeof pm, string> = {
    bun: "bun install -g @anthropic-ai/claude-code@latest",
    npm: "npm install -g @anthropic-ai/claude-code@latest",
    pnpm: "pnpm add -g @anthropic-ai/claude-code@latest",
    deno: "deno install --reload -g npm:@anthropic-ai/claude-code@latest",
  };
  try {
    console.log("Updating @anthropic-ai/claude-code...");
    execSync(commands[pm], { stdio: "inherit" });
    console.log("Update completed successfully!");
  } catch (err: unknown) {
    throw new ClaudeMultiError(ErrorCode.UPDATE_FAILED, `Failed to update @anthropic-ai/claude-code: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }
}
