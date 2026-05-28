import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import semver from "semver";
import { ClaudeMultiError, ErrorCode } from "@/errors";
import { detectPackageManager } from "@/util/runtime";
import { PINNED_BIN_DIR, PINNED_CLAUDE_BIN } from "@/paths";

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
  execSync(commands[pm], { stdio: "inherit" });
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
 * Check if a Claude Code version has broken 3rd party API compatibility.
 * v2.1.154+ dropped support for non-Anthropic API endpoints.
 */
export function isThirdPartyApiBroken(version: string): boolean {
  return semver.gte(version, "2.1.154");
}

export const COMPATIBLE_CLAUDE_VERSION = "2.1.153";

/**
 * Reads the version of the pinned Claude binary installed at ~/.claude-multi/bin/
 */
export function getPinnedBinaryVersion(): string | null {
  const pkgJsonPath = join(
    PINNED_BIN_DIR,
    "node_modules",
    "@anthropic-ai",
    "claude-code",
    "package.json",
  );
  try {
    if (!existsSync(pkgJsonPath)) return null;
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as { version?: string };
    return pkg.version ?? null;
  } catch {
    return null;
  }
}

/**
 * Installs a compatible version of Claude Code to ~/.claude-multi/bin/
 */
export function installPinnedClaude(): void {
  const pm = detectPackageManager();

  mkdirSync(PINNED_BIN_DIR, { recursive: true });

  // Ensure a package.json exists for the install
  const pkgJsonPath = join(PINNED_BIN_DIR, "package.json");
  if (!existsSync(pkgJsonPath)) {
    writeFileSync(pkgJsonPath, JSON.stringify({ dependencies: {} }, null, 2));
  }

  const pkg = `@anthropic-ai/claude-code@${COMPATIBLE_CLAUDE_VERSION}`;
  const commands: Record<typeof pm, string> = {
    bun: `bun add --cwd ${PINNED_BIN_DIR} ${pkg}`,
    npm: `npm install --prefix ${PINNED_BIN_DIR} ${pkg}`,
    pnpm: `pnpm add --dir ${PINNED_BIN_DIR} ${pkg}`,
    deno: `cd ${PINNED_BIN_DIR} && npm install ${pkg}`,
  };

  try {
    execSync(commands[pm], { stdio: "inherit" });
  } catch (err: unknown) {
    throw new ClaudeMultiError(
      ErrorCode.UPDATE_FAILED,
      `Failed to install pinned Claude v${COMPATIBLE_CLAUDE_VERSION}: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    );
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
