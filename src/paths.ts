import { homedir } from "node:os";
import { join } from "node:path";

export function getBaseDir(): string {
  return process.env.CLAUDE_MULTI_HOME || homedir();
}

/** [SAFE PARK] Directory for the pinned Claude Code binary */
export const PINNED_BIN_DIR = join(homedir(), ".claude-multi", "bin");

/** [SAFE PARK] Path to the pinned Claude Code binary */
export const PINNED_CLAUDE_BIN =
  process.platform === "win32"
    ? join(PINNED_BIN_DIR, "node_modules", ".bin", "claude.cmd")
    : join(PINNED_BIN_DIR, "node_modules", ".bin", "claude");
