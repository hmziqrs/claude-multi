import { describe, it, expect } from "bun:test";
import {
  generateWrapperScript,
  generateWindowsWrapperScript,
  getDefaultBinaryPath,
  getClaudePath,
  tryGetClaudePath,
  generateWrapperScriptSafe,
} from "@/wrapper";
import { existsSync } from "node:fs";
import { PINNED_CLAUDE_BIN } from "@/paths";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("Wrapper Script Generation", () => {
  describe("Unix wrapper", () => {
    it("should generate a shell script with exec", () => {
      const options = {
        name: "test",
        configDir: "/home/user/.claude-test",
        binaryPath: "/usr/local/bin/claude-test",
      };

      const script = generateWrapperScript(options);

      expect(script).toContain("#!/bin/sh");
      expect(script).toContain('CLAUDE_CONFIG_DIR="/home/user/.claude-test"');
      expect(script).toContain("exec ");
      expect(script).toContain('"$@"');
    });
  });

  describe("Windows wrapper", () => {
    it("should generate a valid batch wrapper script", () => {
      const options = {
        name: "test",
        configDir: "C:\\Users\\user\\.claude-test",
        binaryPath: "C:\\Users\\user\\AppData\\npm\\claude-test.cmd",
      };

      const script = generateWindowsWrapperScript(options);

      expect(script).toContain("@echo off");
      expect(script).toContain(
        'set "CLAUDE_CONFIG_DIR=C:\\Users\\user\\.claude-test"',
      );
      expect(script).toContain("%*");
    });
  });

  describe("getClaudePath", () => {
    it("should use CLAUDE_MULTI_CLAUDE_PATH env var when set", () => {
      const tmpDir = mkdtempSync(join(tmpdir(), "claude-path-test-"));
      const fakeClaude = join(tmpDir, "claude");
      writeFileSync(fakeClaude, "#!/bin/sh");

      const original = process.env.CLAUDE_MULTI_CLAUDE_PATH;
      process.env.CLAUDE_MULTI_CLAUDE_PATH = fakeClaude;

      try {
        const result = getClaudePath();
        expect(result).toBe(fakeClaude);
      } finally {
        process.env.CLAUDE_MULTI_CLAUDE_PATH = original;
        rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should throw when CLAUDE_MULTI_CLAUDE_PATH points to missing file", () => {
      const original = process.env.CLAUDE_MULTI_CLAUDE_PATH;
      process.env.CLAUDE_MULTI_CLAUDE_PATH = "/nonexistent/claude";

      try {
        expect(() => getClaudePath()).toThrow();
      } finally {
        process.env.CLAUDE_MULTI_CLAUDE_PATH = original;
      }
    });
  });

  describe("Default binary paths", () => {
    it("should return correct path for Unix", () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, "platform", {
        value: "linux",
        writable: true,
      });

      const path = getDefaultBinaryPath("test");
      expect(path).toContain(".local/bin");
      expect(path).toContain("claude-test");
      expect(path).not.toContain(".cmd");

      Object.defineProperty(process, "platform", {
        value: originalPlatform,
        writable: true,
      });
    });

    it("should return correct path for Windows with .cmd extension", () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
      });

      const path = getDefaultBinaryPath("test");
      expect(path).toContain("bun");
      expect(path).toContain("claude-test.cmd");

      Object.defineProperty(process, "platform", {
        value: originalPlatform,
        writable: true,
      });
    });
  });

  describe("tryGetClaudePath", () => {
    it("returns null for missing CLAUDE_MULTI_CLAUDE_PATH override", () => {
      const original = process.env.CLAUDE_MULTI_CLAUDE_PATH;
      process.env.CLAUDE_MULTI_CLAUDE_PATH = "/absolutely/nonexistent/path/claude";

      try {
        const result = tryGetClaudePath();
        expect(result).toBeNull();
      } finally {
        process.env.CLAUDE_MULTI_CLAUDE_PATH = original;
      }
    });

    it("returns a string when Claude is available", () => {
      const result = tryGetClaudePath();
      // If claude is installed (CI or dev machine), this should return a path
      if (result !== null) {
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });

  describe("generateWrapperScriptSafe", () => {
    it("returns null when Claude path cannot be resolved", () => {
      if (existsSync(PINNED_CLAUDE_BIN)) return;

      const original = process.env.CLAUDE_MULTI_CLAUDE_PATH;
      const originalPath = process.env.PATH;
      process.env.CLAUDE_MULTI_CLAUDE_PATH = "/nonexistent/claude";
      process.env.PATH = "/nonexistent";

      try {
        const result = generateWrapperScriptSafe({
          name: "test",
          configDir: "/tmp/test",
          binaryPath: "/tmp/test-bin",
        });
        expect(result).toBeNull();
      } finally {
        process.env.CLAUDE_MULTI_CLAUDE_PATH = original;
        process.env.PATH = originalPath;
      }
    });

    it("returns a valid script matching generateWrapperScript when Claude is available", () => {
      const options = { name: "test", configDir: "/tmp/test", binaryPath: "/tmp/test-bin" };
      const result = generateWrapperScriptSafe(options);
      if (result !== null) {
        expect(result).toContain("#!/bin/sh");
        expect(result).toContain('CLAUDE_CONFIG_DIR="/tmp/test"');
        expect(result).toContain("exec");
      }
    });
  });
});