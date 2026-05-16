import { homedir } from "node:os";

export function getBaseDir(): string {
  return process.env.CLAUDE_MULTI_HOME || homedir();
}
