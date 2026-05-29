import { describe, test, expect } from "bun:test";
import { getClaudeMultiVersion, isThirdPartyApiBroken, COMPATIBLE_CLAUDE_VERSION, getPinnedBinaryVersion } from "@/version";
import { existsSync } from "node:fs";
import { PINNED_CLAUDE_BIN } from "@/paths";
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

describe("isThirdPartyApiBroken", () => {
  test("versions before 2.1.154 are fine", () => {
    expect(isThirdPartyApiBroken("2.1.153")).toBe(false);
    expect(isThirdPartyApiBroken("2.1.0")).toBe(false);
    expect(isThirdPartyApiBroken("2.0.0")).toBe(false);
    expect(isThirdPartyApiBroken("1.0.0")).toBe(false);
    expect(isThirdPartyApiBroken("0.5.7")).toBe(false);
  });

  test("2.1.154 and 2.1.155 are broken", () => {
    expect(isThirdPartyApiBroken("2.1.154")).toBe(true);
    expect(isThirdPartyApiBroken("2.1.155")).toBe(true);
  });

  test("2.1.156+ are fixed", () => {
    expect(isThirdPartyApiBroken("2.1.156")).toBe(false);
    expect(isThirdPartyApiBroken("2.1.157")).toBe(false);
    expect(isThirdPartyApiBroken("2.2.0")).toBe(false);
    expect(isThirdPartyApiBroken("3.0.0")).toBe(false);
    expect(isThirdPartyApiBroken("10.0.0")).toBe(false);
  });
});

describe("COMPATIBLE_CLAUDE_VERSION", () => {
  test("is the first version with the 3rd-party provider fix", () => {
    expect(COMPATIBLE_CLAUDE_VERSION).toBe("2.1.156");
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
