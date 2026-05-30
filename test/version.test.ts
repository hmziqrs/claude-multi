import { describe, test, expect } from "bun:test";
import { getClaudeMultiVersion } from "@/version";
import { chdir } from "node:process";

describe("getClaudeMultiVersion", () => {
  test("returns a valid semver string regardless of cwd", () => {
    const originalCwd = process.cwd();
    try {
      chdir("/tmp");
      const version = getClaudeMultiVersion();
      expect(typeof version).toBe("string");
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    } finally {
      chdir(originalCwd);
    }
  });
});
