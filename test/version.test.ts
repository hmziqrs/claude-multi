import { describe, test, expect } from "bun:test";
import { compareVersions, getClaudeMultiVersion, isThirdPartyApiBroken, COMPATIBLE_CLAUDE_VERSION, getPinnedBinaryVersion } from "@/version";
import { existsSync } from "node:fs";
import { PINNED_CLAUDE_BIN } from "@/paths";
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

describe("isThirdPartyApiBroken", () => {
  test("versions before 2.1.154 are fine", () => {
    expect(isThirdPartyApiBroken("2.1.153")).toBe(false);
    expect(isThirdPartyApiBroken("2.1.0")).toBe(false);
    expect(isThirdPartyApiBroken("2.0.0")).toBe(false);
    expect(isThirdPartyApiBroken("1.0.0")).toBe(false);
    expect(isThirdPartyApiBroken("0.5.7")).toBe(false);
  });

  test("2.1.154 is broken", () => {
    expect(isThirdPartyApiBroken("2.1.154")).toBe(true);
  });

  test("versions after 2.1.154 are broken", () => {
    expect(isThirdPartyApiBroken("2.1.155")).toBe(true);
    expect(isThirdPartyApiBroken("2.2.0")).toBe(true);
    expect(isThirdPartyApiBroken("2.2.1")).toBe(true);
    expect(isThirdPartyApiBroken("3.0.0")).toBe(true);
    expect(isThirdPartyApiBroken("10.0.0")).toBe(true);
  });
});

describe("COMPATIBLE_CLAUDE_VERSION", () => {
  test("is the last safe version before the breakage", () => {
    expect(COMPATIBLE_CLAUDE_VERSION).toBe("2.1.153");
    expect(isThirdPartyApiBroken(COMPATIBLE_CLAUDE_VERSION)).toBe(false);
  });
});

describe("getPinnedBinaryVersion", () => {
  test("returns null when pinned binary is not installed", () => {
    if (existsSync(PINNED_CLAUDE_BIN)) return;
    expect(getPinnedBinaryVersion()).toBeNull();
  });

  test("returns a version string when pinned binary is installed", () => {
    if (!existsSync(PINNED_CLAUDE_BIN)) return;
    const version = getPinnedBinaryVersion();
    expect(version).not.toBeNull();
    expect(typeof version).toBe("string");
    expect(version!).toMatch(/^\d+\.\d+\.\d+/);
  });
});
