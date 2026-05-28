import { homedir } from "node:os";
import { join } from "node:path";

export function getBaseDir(): string {
  return process.env.CLAUDE_MULTI_HOME || homedir();
}

export const PINNED_BIN_DIR = join(homedir(), ".claude-multi", "bin");

export const PINNED_CLAUDE_BIN =
  process.platform === "win32"
    ? join(PINNED_BIN_DIR, "node_modules", ".bin", "claude.cmd")
    : join(PINNED_BIN_DIR, "node_modules", ".bin", "claude");
