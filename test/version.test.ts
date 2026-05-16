import { describe, test, expect } from "bun:test";
import { compareVersions, getClaudeMultiVersion } from "@/version";
import { chdir } from "node:process";

describe("compareVersions", () => {
  test("equal versions return 0", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("0.5.0", "0.5.0")).toBe(0);
  });

  test("lower version returns -1", () => {
    expect(compareVersions("1.0.0", "2.0.0")).toBe(-1);
    expect(compareVersions("1.2.3", "1.2.4")).toBe(-1);
    expect(compareVersions("0.9.9", "1.0.0")).toBe(-1);
  });

  test("higher version returns 1", () => {
    expect(compareVersions("2.0.0", "1.0.0")).toBe(1);
    expect(compareVersions("1.2.4", "1.2.3")).toBe(1);
  });

  test("handles missing patch segment", () => {
    expect(compareVersions("1.0", "1.0.0")).toBe(0);
    expect(compareVersions("1.1", "1.0.0")).toBe(1);
  });
});

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
