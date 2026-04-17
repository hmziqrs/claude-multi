import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  syncPluginsAndSkills,
  unsyncPluginsAndSkills,
  copySettingsFromDefault,
  copyAllFromDefault,
  readClaudeSettings,
  detectBrokenSymlinks,
} from "../src/config";
import { AutoSyncTestHelper } from "./test-utils";
import { dirname, join, relative } from "node:path";

describe("syncPluginsAndSkills", () => {
  let helper: AutoSyncTestHelper;
  let instanceConfigDir: string;
  let defaultClaudeDir: string;

  beforeEach(async () => {
    helper = new AutoSyncTestHelper();
    const setup = await helper.setup();
    instanceConfigDir = setup.instanceConfigDir;
    defaultClaudeDir = setup.defaultClaudeDir;
  });

  afterEach(() => {
    helper.teardown();
    helper.cleanup();
  });

  describe("basic symlink creation", () => {
    it("should create symlinks for plugins and skills directories", async () => {
      // Create the instance config directory first
      await helper.createDirectory(instanceConfigDir);

      await syncPluginsAndSkills(instanceConfigDir);

      // Check that symlinks were created
      const pluginsPath = `${instanceConfigDir}/plugins`;
      const skillsPath = `${instanceConfigDir}/skills`;

      helper.assertSymlink(pluginsPath);
      helper.assertSymlink(skillsPath);

      // Verify symlinks point to the right place
      const { readlink } = await import("node:fs/promises");
      const pluginsLink = await readlink(pluginsPath);
      const skillsLink = await readlink(skillsPath);

      // Should be relative paths
      expect(pluginsLink).toContain(".claude");
      expect(skillsLink).toContain(".claude");
    });

    it("should compute correct relative symlink targets for sibling config dirs", async () => {
      const baseDir = dirname(defaultClaudeDir);
      const siblingInstanceDir = join(baseDir, ".claude-sibling");
      await helper.createDirectory(siblingInstanceDir);

      await syncPluginsAndSkills(siblingInstanceDir);

      const { readlink } = await import("node:fs/promises");
      const pluginsLink = await readlink(`${siblingInstanceDir}/plugins`);
      const skillsLink = await readlink(`${siblingInstanceDir}/skills`);

      expect(pluginsLink).toBe(relative(siblingInstanceDir, join(defaultClaudeDir, "plugins")));
      expect(skillsLink).toBe(relative(siblingInstanceDir, join(defaultClaudeDir, "skills")));
    });

    it("should create symlinks that resolve to actual files", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);

      // Check that we can read files through the symlinks
      const settingsContent = await helper.readFile(`${instanceConfigDir}/plugins/plugin1.json`);
      expect(JSON.parse(settingsContent)).toEqual({ name: "plugin1" });

      const skillContent = await helper.readFile(`${instanceConfigDir}/skills/skill1.ts`);
      expect(skillContent).toBe("// skill1 content");
    });
  });

  describe("already-synced state", () => {
    it("should not recreate symlinks if they already exist and point correctly", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);

      // Get the initial symlink targets
      const { readlink } = await import("node:fs/promises");
      const pluginsPath = `${instanceConfigDir}/plugins`;
      const initialLink = await readlink(pluginsPath);

      // Sync again
      await syncPluginsAndSkills(instanceConfigDir);

      // Check that the symlink is still the same
      const afterLink = await readlink(pluginsPath);
      expect(afterLink).toBe(initialLink);
    });

    it("should handle case where directories are already synced", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir); // Second sync

      // Should still be symlinks
      helper.assertSymlink(`${instanceConfigDir}/plugins`);
      helper.assertSymlink(`${instanceConfigDir}/skills`);
    });
  });

  describe("missing source directories", () => {
    it("should skip syncing if source plugins directory doesn't exist", async () => {
      // Remove plugins from default
      const { rmSync } = await import("node:fs");
      rmSync(`${defaultClaudeDir}/plugins`, { recursive: true, force: true });

      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);

      // Only skills should be synced
      helper.assertSymlink(`${instanceConfigDir}/skills`);
      helper.assertNotExists(`${instanceConfigDir}/plugins`);
    });

    it("should skip syncing if source skills directory doesn't exist", async () => {
      // Remove skills from default
      const { rmSync } = await import("node:fs");
      rmSync(`${defaultClaudeDir}/skills`, { recursive: true, force: true });

      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);

      // Only plugins should be synced
      helper.assertSymlink(`${instanceConfigDir}/plugins`);
      helper.assertNotExists(`${instanceConfigDir}/skills`);
    });

    it("should handle both source directories missing", async () => {
      // Remove both from default
      const { rmSync } = await import("node:fs");
      rmSync(`${defaultClaudeDir}/plugins`, { recursive: true, force: true });
      rmSync(`${defaultClaudeDir}/skills`, { recursive: true, force: true });

      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);

      // Neither should exist
      helper.assertNotExists(`${instanceConfigDir}/plugins`);
      helper.assertNotExists(`${instanceConfigDir}/skills`);
    });
  });

  describe("replacing incorrect symlinks", () => {
    it("should replace regular directory with symlink", async () => {
      await helper.createDirectory(instanceConfigDir);

      // Create a regular directory with content
      await helper.createDirectory(`${instanceConfigDir}/plugins`);
      await helper.createFile(`${instanceConfigDir}/plugins/wrong.json`, "wrong content");

      // Sync should replace directory with symlink
      await syncPluginsAndSkills(instanceConfigDir);

      helper.assertSymlink(`${instanceConfigDir}/plugins`);

      // Should now point to correct content
      const content = await helper.readFile(`${instanceConfigDir}/plugins/plugin1.json`);
      expect(JSON.parse(content)).toEqual({ name: "plugin1" });
    });
  });

  describe("error handling", () => {
    it("should throw error if instance config directory doesn't exist", async () => {
      const nonExistentDir = "/tmp/claude-test-non-existent-xyz";
      let threw = false;
      try {
        await syncPluginsAndSkills(nonExistentDir);
      } catch (e) {
        threw = true;
        expect((e as Error).message).toContain("Instance config directory does not exist");
      }
      expect(threw).toBe(true);
    });
  });
});

describe("unsyncPluginsAndSkills", () => {
  let helper: AutoSyncTestHelper;
  let instanceConfigDir: string;
  let defaultClaudeDir: string;

  beforeEach(async () => {
    helper = new AutoSyncTestHelper();
    const setup = await helper.setup();
    instanceConfigDir = setup.instanceConfigDir;
    defaultClaudeDir = setup.defaultClaudeDir;
  });

  afterEach(() => {
    helper.teardown();
    helper.cleanup();
  });

  describe("basic unsync", () => {
    it("should convert symlinks to regular directories with copies", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);

      // Verify symlinks exist
      helper.assertSymlink(`${instanceConfigDir}/plugins`);
      helper.assertSymlink(`${instanceConfigDir}/skills`);

      // Unsync
      await unsyncPluginsAndSkills(instanceConfigDir);

      // Should now be regular directories
      helper.assertRegularDirectory(`${instanceConfigDir}/plugins`);
      helper.assertRegularDirectory(`${instanceConfigDir}/skills`);

      // Verify files were copied
      const content = await helper.readFile(`${instanceConfigDir}/plugins/plugin1.json`);
      expect(JSON.parse(content)).toEqual({ name: "plugin1" });
    });

    it("should copy all files recursively", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);
      await unsyncPluginsAndSkills(instanceConfigDir);

      // Check nested files were copied
      helper.assertExists(`${instanceConfigDir}/plugins/plugin1.json`);
      helper.assertExists(`${instanceConfigDir}/plugins/plugin2.json`);
      helper.assertExists(`${instanceConfigDir}/plugins/nested/nested-plugin.json`);
      helper.assertExists(`${instanceConfigDir}/skills/skill1.ts`);
      helper.assertExists(`${instanceConfigDir}/skills/skill2.ts`);
    });
  });

  describe("recursive copying", () => {
    it("should preserve nested directory structure", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);
      await unsyncPluginsAndSkills(instanceConfigDir);

      // Check that nested structure is preserved
      helper.assertExists(`${instanceConfigDir}/plugins/nested/nested-plugin.json`);

      const content = await helper.readFile(`${instanceConfigDir}/plugins/nested/nested-plugin.json`);
      expect(JSON.parse(content)).toEqual({ name: "nested" });
    });

    it("should copy all files in nested directories", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);
      await unsyncPluginsAndSkills(instanceConfigDir);

      // Count files in plugins
      const pluginFiles = helper.countFiles(`${instanceConfigDir}/plugins`);
      expect(pluginFiles).toBeGreaterThan(0);
    });
  });

  describe("missing source", () => {
    it("should skip unsync if source plugins directory doesn't exist", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);

      // Remove source plugins
      const { rmSync } = await import("node:fs");
      rmSync(`${defaultClaudeDir}/plugins`, { recursive: true, force: true });

      // Skills should still be unsynced
      await unsyncPluginsAndSkills(instanceConfigDir);

      helper.assertRegularDirectory(`${instanceConfigDir}/skills`);
    });

    it("should skip unsync if source skills directory doesn't exist", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);

      // Remove source skills
      const { rmSync } = await import("node:fs");
      rmSync(`${defaultClaudeDir}/skills`, { recursive: true, force: true });

      // Plugins should still be unsynced
      await unsyncPluginsAndSkills(instanceConfigDir);

      helper.assertRegularDirectory(`${instanceConfigDir}/plugins`);
    });
  });

  describe("already regular directories", () => {
    it("should skip if directory is already a regular directory", async () => {
      await helper.createDirectory(instanceConfigDir);

      // Create regular directories manually
      await helper.createDirectory(`${instanceConfigDir}/plugins`);
      await helper.createDirectory(`${instanceConfigDir}/skills`);

      // Unsync should skip these
      await unsyncPluginsAndSkills(instanceConfigDir);

      // Should still be regular directories
      helper.assertRegularDirectory(`${instanceConfigDir}/plugins`);
      helper.assertRegularDirectory(`${instanceConfigDir}/skills`);

      // Should be empty (no files copied since they were already regular dirs)
      const { readdirSync } = await import("node:fs");
      const plugins = readdirSync(`${instanceConfigDir}/plugins`);
      expect(plugins.length).toBe(0);
    });
  });

  describe("idempotency", () => {
    it("should be idempotent - can unsync multiple times", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);

      // First unsync
      await unsyncPluginsAndSkills(instanceConfigDir);

      // Get file count
      const fileCount1 = helper.countFiles(`${instanceConfigDir}/plugins`);

      // Second unsync
      await unsyncPluginsAndSkills(instanceConfigDir);

      // File count should be the same
      const fileCount2 = helper.countFiles(`${instanceConfigDir}/plugins`);
      expect(fileCount2).toBe(fileCount1);
    });
  });

  describe("error handling", () => {
    it("should throw error if instance config directory doesn't exist", async () => {
      const nonExistentDir = "/tmp/claude-test-non-existent-xyz";
      let threw = false;
      try {
        await unsyncPluginsAndSkills(nonExistentDir);
      } catch (e) {
        threw = true;
        expect((e as Error).message).toContain("Instance config directory does not exist");
      }
      expect(threw).toBe(true);
    });
  });
});

describe("copySettingsFromDefault", () => {
  let helper: AutoSyncTestHelper;
  let instanceConfigDir: string;

  beforeEach(async () => {
    helper = new AutoSyncTestHelper();
    const setup = await helper.setup();
    instanceConfigDir = setup.instanceConfigDir;
  });

  afterEach(() => {
    helper.teardown();
    helper.cleanup();
  });

  describe("basic copy", () => {
    it("should copy only safe (whitelisted) settings from default to target", async () => {
      await copySettingsFromDefault(instanceConfigDir);

      helper.assertExists(`${instanceConfigDir}/settings.json`);

      const content = await helper.readFile(`${instanceConfigDir}/settings.json`);
      const settings = JSON.parse(content);

      // Whitelisted settings should be copied
      expect(settings.enabledPlugins).toBeDefined();
      
      // SECURITY: Sensitive data should NOT be copied
      expect(settings.mcpServers).toBeUndefined();
      expect(settings.env).toBeUndefined();
    });

    it("should copy whitelisted settings.json content correctly", async () => {
      await copySettingsFromDefault(instanceConfigDir);

      const settings = await readClaudeSettings(instanceConfigDir);

      expect(settings).toBeDefined();
      expect(settings?.enabledPlugins).toEqual({
        plugin1: true,
        plugin2: false,
      });
      
      // SECURITY: Verify sensitive data is not copied
      expect(settings?.mcpServers).toBeUndefined();
      expect(settings?.env).toBeUndefined();
    });
  });

  describe("directory creation", () => {
    it("should create target directory if it doesn't exist", async () => {
      // instanceConfigDir should exist after copy
      await copySettingsFromDefault(instanceConfigDir);

      helper.assertExists(instanceConfigDir);
      helper.assertExists(`${instanceConfigDir}/settings.json`);
    });

    it("should not error if target directory already exists", async () => {
      await helper.createDirectory(instanceConfigDir);

      await copySettingsFromDefault(instanceConfigDir);

      helper.assertExists(`${instanceConfigDir}/settings.json`);
    });
  });

  describe("missing source error", () => {
    it("should throw error if source settings.json doesn't exist", async () => {
      // Remove settings.json from default
      const { unlinkSync } = await import("node:fs");
      unlinkSync(`${helper.getDefaultClaudeDir()}/settings.json`);

      let threw = false;
      try {
        await copySettingsFromDefault(instanceConfigDir);
      } catch (e) {
        threw = true;
        expect((e as Error).message).toContain("Default Claude settings.json not found");
      }
      expect(threw).toBe(true);
    });
  });

  describe("preserving existing files", () => {
    it("should overwrite existing settings.json", async () => {
      await helper.createDirectory(instanceConfigDir);

      // Create a different settings.json
      await helper.createFile(
        `${instanceConfigDir}/settings.json`,
        JSON.stringify({ different: "content" }),
      );

      await copySettingsFromDefault(instanceConfigDir);

      // Should have the new content
      const content = await helper.readFile(`${instanceConfigDir}/settings.json`);
      const settings = JSON.parse(content);

      expect(settings.different).toBeUndefined();
      expect(settings.enabledPlugins).toBeDefined();
    });
  });
});

describe("copyAllFromDefault", () => {
  let helper: AutoSyncTestHelper;
  let instanceConfigDir: string;

  beforeEach(async () => {
    helper = new AutoSyncTestHelper();
    const setup = await helper.setup();
    instanceConfigDir = setup.instanceConfigDir;
  });

  afterEach(() => {
    helper.teardown();
    helper.cleanup();
  });

  describe("autoSync mode (symlinks)", () => {
    it("should create symlinks for plugins and skills when autoSync is true", async () => {
      await copyAllFromDefault(instanceConfigDir, true);

      helper.assertSymlink(`${instanceConfigDir}/plugins`);
      helper.assertSymlink(`${instanceConfigDir}/skills`);
    });

    it("should replace broken symlinks before creating new ones", async () => {
      const { symlink } = await import("node:fs/promises");
      await symlink("/nonexistent/path", `${instanceConfigDir}/plugins`, "dir");

      await copyAllFromDefault(instanceConfigDir, true);

      helper.assertSymlink(`${instanceConfigDir}/plugins`);
      const { readlink } = await import("node:fs/promises");
      const linkTarget = await readlink(`${instanceConfigDir}/plugins`);
      expect(linkTarget).toContain(".claude");
    });

    it("should copy settings.json when autoSync is true", async () => {
      await copyAllFromDefault(instanceConfigDir, true);

      helper.assertExists(`${instanceConfigDir}/settings.json`);

      const settings = await readClaudeSettings(instanceConfigDir);
      expect(settings?.enabledPlugins).toBeDefined();
    });

    it("should copy regular files when autoSync is true", async () => {
      await copyAllFromDefault(instanceConfigDir, true);

      helper.assertExists(`${instanceConfigDir}/custom-file.txt`);

      const content = await helper.readFile(`${instanceConfigDir}/custom-file.txt`);
      expect(content).toBe("custom content");
    });
  });

  describe("manual mode (copies)", () => {
    it("should copy plugins and skills when autoSync is false", async () => {
      await copyAllFromDefault(instanceConfigDir, false);

      helper.assertRegularDirectory(`${instanceConfigDir}/plugins`);
      helper.assertRegularDirectory(`${instanceConfigDir}/skills`);

      // Verify files were copied
      helper.assertExists(`${instanceConfigDir}/plugins/plugin1.json`);
      helper.assertExists(`${instanceConfigDir}/skills/skill1.ts`);
    });

    it("should copy all nested files when autoSync is false", async () => {
      await copyAllFromDefault(instanceConfigDir, false);

      helper.assertExists(`${instanceConfigDir}/plugins/nested/nested-plugin.json`);

      const content = await helper.readFile(`${instanceConfigDir}/plugins/nested/nested-plugin.json`);
      expect(JSON.parse(content)).toEqual({ name: "nested" });
    });

    it("should copy settings.json when autoSync is false", async () => {
      await copyAllFromDefault(instanceConfigDir, false);

      helper.assertExists(`${instanceConfigDir}/settings.json`);

      const settings = await readClaudeSettings(instanceConfigDir);
      expect(settings?.enabledPlugins).toBeDefined();
    });
  });

  describe("excluded files", () => {
    it("should not copy config.json", async () => {
      await copyAllFromDefault(instanceConfigDir, true);
      helper.assertNotExists(`${instanceConfigDir}/config.json`);
    });

    it("should not copy history.jsonl", async () => {
      await copyAllFromDefault(instanceConfigDir, true);
      helper.assertNotExists(`${instanceConfigDir}/history.jsonl`);
    });

    it("should not copy debug directory", async () => {
      await copyAllFromDefault(instanceConfigDir, true);
      helper.assertNotExists(`${instanceConfigDir}/debug`);
    });

    it("should not copy session-env directory", async () => {
      await copyAllFromDefault(instanceConfigDir, true);
      helper.assertNotExists(`${instanceConfigDir}/session-env`);
    });

    it("should not copy todos directory", async () => {
      await copyAllFromDefault(instanceConfigDir, true);
      helper.assertNotExists(`${instanceConfigDir}/todos`);
    });
  });

  describe("nested structures", () => {
    it("should preserve nested directory structure in copy mode", async () => {
      await copyAllFromDefault(instanceConfigDir, false);

      helper.assertExists(`${instanceConfigDir}/plugins/nested/nested-plugin.json`);

      const content = await helper.readFile(`${instanceConfigDir}/plugins/nested/nested-plugin.json`);
      expect(JSON.parse(content)).toEqual({ name: "nested" });
    });

    it("should handle multiple levels of nesting", async () => {
      // Create deeper nesting in default
      await helper.createDirectory(`${helper.getDefaultClaudeDir()}/plugins/nested/deep`);
      await helper.createFile(
        `${helper.getDefaultClaudeDir()}/plugins/nested/deep/deep.json`,
        JSON.stringify({ deep: true }),
      );

      await copyAllFromDefault(instanceConfigDir, false);

      helper.assertExists(`${instanceConfigDir}/plugins/nested/deep/deep.json`);
    });
  });

  describe("directory creation", () => {
    it("should create target directory if it doesn't exist", async () => {
      await copyAllFromDefault(instanceConfigDir, true);

      helper.assertExists(instanceConfigDir);
    });

    it("should work with existing directory", async () => {
      await helper.createDirectory(instanceConfigDir);

      await copyAllFromDefault(instanceConfigDir, true);

      helper.assertExists(`${instanceConfigDir}/settings.json`);
    });
  });

  describe("error handling", () => {
    it("should throw error if default Claude directory doesn't exist", async () => {
      // Remove the default directory
      const { rmSync } = await import("node:fs");
      rmSync(helper.getDefaultClaudeDir()!, { recursive: true, force: true });

      let threw = false;
      try {
        await copyAllFromDefault(instanceConfigDir, true);
      } catch (e) {
        threw = true;
        expect((e as Error).message).toContain("Default Claude directory not found");
      }
      expect(threw).toBe(true);
    });
  });
});

describe("Integration tests", () => {
  let helper: AutoSyncTestHelper;
  let instanceConfigDir: string;

  beforeEach(async () => {
    helper = new AutoSyncTestHelper();
    const setup = await helper.setup();
    instanceConfigDir = setup.instanceConfigDir;
  });

  afterEach(() => {
    helper.teardown();
    helper.cleanup();
  });

  describe("sync → unsync cycles", () => {
    it("should successfully sync then unsync", async () => {
      await helper.createDirectory(instanceConfigDir);

      // Sync
      await syncPluginsAndSkills(instanceConfigDir);
      helper.assertSymlink(`${instanceConfigDir}/plugins`);
      helper.assertSymlink(`${instanceConfigDir}/skills`);

      // Unsync
      await unsyncPluginsAndSkills(instanceConfigDir);
      helper.assertRegularDirectory(`${instanceConfigDir}/plugins`);
      helper.assertRegularDirectory(`${instanceConfigDir}/skills`);

      // Verify files are still accessible
      const content = await helper.readFile(`${instanceConfigDir}/plugins/plugin1.json`);
      expect(JSON.parse(content)).toEqual({ name: "plugin1" });
    });

    it("should handle multiple sync → unsync cycles", async () => {
      await helper.createDirectory(instanceConfigDir);

      // First cycle
      await syncPluginsAndSkills(instanceConfigDir);
      await unsyncPluginsAndSkills(instanceConfigDir);

      // Second cycle
      await syncPluginsAndSkills(instanceConfigDir);
      helper.assertSymlink(`${instanceConfigDir}/plugins`);

      await unsyncPluginsAndSkills(instanceConfigDir);
      helper.assertRegularDirectory(`${instanceConfigDir}/plugins`);
    });
  });

  describe("auto-sync toggle on/off", () => {
    it("should simulate toggling auto-sync off", async () => {
      // Start with auto-sync enabled (copyAllFromDefault with autoSync=true)
      await copyAllFromDefault(instanceConfigDir, true);
      helper.assertSymlink(`${instanceConfigDir}/plugins`);

      // Toggle off (unsync)
      await unsyncPluginsAndSkills(instanceConfigDir);
      helper.assertRegularDirectory(`${instanceConfigDir}/plugins`);

      // Files should still be accessible
      helper.assertExists(`${instanceConfigDir}/plugins/plugin1.json`);
    });

    it("should simulate toggling auto-sync on", async () => {
      // Start with auto-sync disabled (copyAllFromDefault with autoSync=false)
      await copyAllFromDefault(instanceConfigDir, false);
      helper.assertRegularDirectory(`${instanceConfigDir}/plugins`);

      // Toggle on (sync)
      await syncPluginsAndSkills(instanceConfigDir);
      helper.assertSymlink(`${instanceConfigDir}/plugins`);

      // Files should still be accessible
      const content = await helper.readFile(`${instanceConfigDir}/plugins/plugin1.json`);
      expect(JSON.parse(content)).toEqual({ name: "plugin1" });
    });
  });

  describe("multiple cycles", () => {
    it("should handle sync → unsync → sync → unsync", async () => {
      await helper.createDirectory(instanceConfigDir);

      // Sync
      await syncPluginsAndSkills(instanceConfigDir);
      helper.assertSymlink(`${instanceConfigDir}/plugins`);

      // Unsync
      await unsyncPluginsAndSkills(instanceConfigDir);
      helper.assertRegularDirectory(`${instanceConfigDir}/plugins`);

      // Sync again
      await syncPluginsAndSkills(instanceConfigDir);
      helper.assertSymlink(`${instanceConfigDir}/plugins`);

      // Unsync again
      await unsyncPluginsAndSkills(instanceConfigDir);
      helper.assertRegularDirectory(`${instanceConfigDir}/plugins`);
    });
  });

  describe("file modifications during sync", () => {
    it("should preserve file modifications when unsyncing", async () => {
      await helper.createDirectory(instanceConfigDir);

      // Sync
      await syncPluginsAndSkills(instanceConfigDir);

      // Modify a file through the symlink
      const modifiedContent = JSON.stringify({ name: "plugin1-modified" });
      await helper.createFile(`${instanceConfigDir}/plugins/plugin1.json`, modifiedContent);

      // Unsync
      await unsyncPluginsAndSkills(instanceConfigDir);

      // The modified file should still be there
      const content = await helper.readFile(`${instanceConfigDir}/plugins/plugin1.json`);
      expect(JSON.parse(content)).toEqual({ name: "plugin1-modified" });
    });
  });
});

describe("detectBrokenSymlinks", () => {
  let helper: AutoSyncTestHelper;
  let instanceConfigDir: string;

  beforeEach(async () => {
    helper = new AutoSyncTestHelper();
    const setup = await helper.setup();
    instanceConfigDir = setup.instanceConfigDir;
  });

  afterEach(() => {
    helper.teardown();
    helper.cleanup();
  });

  describe("detecting broken symlinks", () => {
    it("should detect broken symlinks", async () => {
      await helper.createDirectory(instanceConfigDir);

      // Create a broken symlink
      const { symlink } = await import("node:fs/promises");
      await symlink("/nonexistent/path", `${instanceConfigDir}/skills`, "dir");

      const result = detectBrokenSymlinks(instanceConfigDir);
      expect(result.broken).toContain("skills");
      expect(result.all).toContain("skills");
    });

    it("should not break valid symlinks", async () => {
      await helper.createDirectory(instanceConfigDir);
      await syncPluginsAndSkills(instanceConfigDir);

      const result = detectBrokenSymlinks(instanceConfigDir);
      expect(result.broken).toHaveLength(0);
      expect(result.all).toContain("plugins");
      expect(result.all).toContain("skills");
    });

    it("should return empty arrays when no symlinks exist", async () => {
      await helper.createDirectory(instanceConfigDir);

      const result = detectBrokenSymlinks(instanceConfigDir);
      expect(result.broken).toHaveLength(0);
      expect(result.all).toHaveLength(0);
    });

    it("should detect only broken symlinks when mix exists", async () => {
      await helper.createDirectory(instanceConfigDir);

      // Create valid symlink for plugins
      await syncPluginsAndSkills(instanceConfigDir);

      // Create broken symlink for skills
      const { rmSync } = await import("node:fs");
      const { symlink } = await import("node:fs/promises");
      rmSync(`${instanceConfigDir}/skills`, { force: true });
      await symlink("/nonexistent/path", `${instanceConfigDir}/skills`, "dir");

      const result = detectBrokenSymlinks(instanceConfigDir);
      expect(result.broken).toContain("skills");
      expect(result.broken).not.toContain("plugins");
      expect(result.all).toHaveLength(2);
    });
  });

  describe("error handling", () => {
    it("should handle non-existent directory gracefully", async () => {
      const nonExistentDir = "/tmp/claude-test-non-existent-xyz";
      const result = detectBrokenSymlinks(nonExistentDir);
      expect(result.broken).toHaveLength(0);
      expect(result.all).toHaveLength(0);
    });
  });
});
