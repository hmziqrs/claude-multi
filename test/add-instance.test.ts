import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AutoSyncTestHelper } from "./test-utils";
import { ClaudeMultiError, ErrorCode } from "@/errors";
import {
  copySettingsFromDefault,
  copyAllFromDefault,
  readClaudeSettings,
} from "@/config";
import { createWrapper, removeWrapper, getDefaultBinaryPath } from "@/wrapper";

describe("handleAddInstance (component-level tests)", () => {
  let helper: AutoSyncTestHelper;
  let defaultClaudeDir: string;

  beforeEach(async () => {
    helper = new AutoSyncTestHelper();
    const setup = await helper.setup();
    defaultClaudeDir = setup.defaultClaudeDir;
  });

  afterEach(() => {
    helper.teardown();
    helper.cleanup();
  });

  describe("createWrapper", () => {
    it("should create binary wrapper at specified path", async () => {
      const binaryPath = join(helper.getInstanceConfigDir()!, "..", "..", "bin", "claude-test");
      await createWrapper({
        name: "test",
        configDir: helper.getInstanceConfigDir()!,
        binaryPath,
      });
      expect(existsSync(binaryPath)).toBe(true);
      removeWrapper(binaryPath);
    });
  });

  describe("copySettingsFromDefault", () => {
    it("should copy settings from default to target", async () => {
      const configDir = helper.getInstanceConfigDir()!;
      await copySettingsFromDefault(configDir);
      const settings = await readClaudeSettings(configDir);
      expect(settings).not.toBeNull();
      expect(settings!.enabledPlugins).toBeDefined();
    });
  });

  describe("copyAllFromDefault", () => {
    it("should copy all files when requested", async () => {
      const configDir = join(helper.getInstanceConfigDir()!, "..", "test-full");
      await copyAllFromDefault(configDir, false);
      expect(existsSync(join(configDir, "settings.json"))).toBe(true);
      expect(existsSync(join(configDir, "plugins", "plugin1.json"))).toBe(true);
    });
  });

  describe("name validation", () => {
    const NAME_PATTERN = /^[a-zA-Z0-9-_]+$/;

    it("should accept valid names", () => {
      expect(NAME_PATTERN.test("foo")).toBe(true);
      expect(NAME_PATTERN.test("my-instance")).toBe(true);
      expect(NAME_PATTERN.test("test_123")).toBe(true);
      expect(NAME_PATTERN.test("abc-def_456")).toBe(true);
    });

    it("should reject names with spaces", () => {
      expect(NAME_PATTERN.test("foo bar")).toBe(false);
    });

    it("should reject empty or whitespace names", () => {
      expect(NAME_PATTERN.test("")).toBe(false);
      expect(NAME_PATTERN.test("   ")).toBe(false);
    });
  });
});
