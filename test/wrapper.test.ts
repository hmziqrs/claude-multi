import { describe, it, expect } from "bun:test";
import {
  generateWrapperScript,
  generateWindowsWrapperScript,
  getDefaultBinaryPath,
} from "../src/wrapper";

describe("Wrapper Script Generation", () => {
  describe("Unix wrapper", () => {
    it("should generate a valid Node.js wrapper script", () => {
      const options = {
        name: "test",
        configDir: "/home/user/.claude-test",
        binaryPath: "/usr/local/bin/claude-test",
      };

      const script = generateWrapperScript(options);

      expect(script).toContain("#!/usr/bin/env node");
      expect(script).toContain(
        'process.env.CLAUDE_CONFIG_DIR = "/home/user/.claude-test"',
      );
      expect(script).toContain("claude-multi");
      expect(script).toContain("spawn");
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
      expect(script).toContain("claude-multi");
      expect(script).toContain("%*");
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
      expect(path).toContain("npm");
      expect(path).toContain("claude-test.cmd");

      Object.defineProperty(process, "platform", {
        value: originalPlatform,
        writable: true,
      });
    });
  });
});
