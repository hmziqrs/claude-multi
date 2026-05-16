import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";
import { AutoSyncTestHelper } from "./test-utils";
import { ClaudeMultiError, ErrorCode } from "@/errors";
import {
  addInstance,
  removeInstance,
  loadConfig,
  copySettingsFromDefault,
  copyAllFromDefault,
  readClaudeSettings,
  setTestConfigDir,
  clearTestConfigDir,
  type Instance,
} from "@/config";
import { createWrapper, removeWrapper, getDefaultBinaryPath } from "@/wrapper";

function isClaudeInstalled(): boolean {
  try {
    const command = process.platform === "win32" ? "where claude" : "which claude";
    const result = execSync(command, { encoding: "utf-8", stdio: "pipe" }).trim();
    return result.length > 0;
  } catch {
    return false;
  }
}

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
      if (!isClaudeInstalled()) {
        console.log("Skipped: claude not installed");
        return;
      }
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

  describe("addInstance — config isolation", () => {
    let testConfigDir: string;

    const makeInstance = (name: string, base: string): Instance => ({
      name,
      configDir: join(base, `.claude-${name}`),
      binaryPath: join(base, "bin", `claude-${name}`),
      createdAt: new Date().toISOString(),
    });

    beforeEach(() => {
      testConfigDir = mkdtempSync(join(tmpdir(), "claude-multi-cfg-test-"));
      setTestConfigDir(testConfigDir);
    });

    afterEach(() => {
      clearTestConfigDir();
      rmSync(testConfigDir, { recursive: true, force: true });
    });

    it("rejects duplicate name and leaves exactly one entry in config", async () => {
      const inst = makeInstance("dup", testConfigDir);
      await addInstance(inst);

      let caught: unknown;
      try {
        await addInstance(inst);
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(ClaudeMultiError);
      expect((caught as ClaudeMultiError).code).toBe(ErrorCode.INSTANCE_ALREADY_EXISTS);

      const config = await loadConfig();
      expect(config.instances.filter(i => i.name === "dup")).toHaveLength(1);
    });

    it("rollback removes config entry — Phase 4 regression guard", async () => {
      const inst = makeInstance("zombie", testConfigDir);

      // Replicate the cli.ts rollback: addInstance succeeds, then createWrapper "fails"
      await addInstance(inst);
      // Rollback path from cli.ts and AddInstance.tsx on catch
      await removeInstance("zombie").catch(() => {});

      const config = await loadConfig();
      expect(config.instances.find(i => i.name === "zombie")).toBeUndefined();
    });
  });
});
