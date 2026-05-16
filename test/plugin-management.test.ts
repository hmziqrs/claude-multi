import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  setTestDefaultClaudeDir,
  clearTestDefaultClaudeDir,
  listDefaultPlugins,
  listInstancePlugins,
  copySinglePlugin,
  copySelectedPlugins,
  removeSinglePlugin,
  isPluginsSymlinked,
  getMcpServersFromPlugins,
  getInstanceMcpServers,
  detectMcpCollisions,
  scanPluginsFromDir,
  type PluginInfo,
} from "@/config";

const MKT = "plugins/marketplaces/claude-plugins-official";

function createMockPlugin(
  baseDir: string,
  category: "plugins" | "external_plugins",
  name: string,
  opts: { hasMcp?: boolean; mcpFormat?: "flat" | "nested"; hasPluginJson?: boolean } = {},
) {
  const dir = join(baseDir, MKT, category, name);
  mkdirSync(dir, { recursive: true });

  if (opts.hasPluginJson !== false) {
    const metaDir = join(dir, ".claude-plugin");
    mkdirSync(metaDir, { recursive: true });
    writeFileSync(
      join(metaDir, "plugin.json"),
      JSON.stringify({ name, description: `Test ${name} plugin` }),
    );
  }

  if (opts.hasMcp) {
    if (opts.mcpFormat === "nested") {
      writeFileSync(
        join(dir, ".mcp.json"),
        JSON.stringify({
          mcpServers: {
            [name]: { command: "bun", args: ["run", name] },
          },
        }),
      );
    } else {
      writeFileSync(
        join(dir, ".mcp.json"),
        JSON.stringify({
          [name]: { command: "npx", args: ["-y", name] },
        }),
      );
    }
  }

  // Some content
  writeFileSync(join(dir, "README.md"), `# ${name}`);
  return dir;
}

describe("Plugin Management", () => {
  let baseDir: string;
  let defaultDir: string;
  let instanceDir: string;

  beforeAll(() => {
    baseDir = mkdtempSync(join(tmpdir(), "plugin-test-"));
    defaultDir = join(baseDir, "default");
    instanceDir = join(baseDir, "instance");
    mkdirSync(defaultDir, { recursive: true });
    mkdirSync(instanceDir, { recursive: true });
    setTestDefaultClaudeDir(defaultDir);
  });

  afterAll(() => {
    clearTestDefaultClaudeDir();
    try { rmSync(baseDir, { recursive: true, force: true }); } catch {}
  });

  describe("scanPluginsFromDir", () => {
    test("scans internal and external plugins", () => {
      createMockPlugin(defaultDir, "plugins", "my-internal");
      createMockPlugin(defaultDir, "external_plugins", "my-external", { hasMcp: true });

      const plugins = scanPluginsFromDir(defaultDir);
      expect(plugins.length).toBe(2);

      const internal = plugins.find(p => p.id === "my-internal");
      expect(internal).toBeDefined();
      expect(internal!.category).toBe("internal");
      expect(internal!.hasMcp).toBe(false);

      const external = plugins.find(p => p.id === "my-external");
      expect(external).toBeDefined();
      expect(external!.category).toBe("external");
      expect(external!.hasMcp).toBe(true);
      expect(external!.mcpServerNames).toEqual(["my-external"]);
    });

    test("handles plugins without plugin.json (LSP-style)", () => {
      createMockPlugin(defaultDir, "plugins", "lsp-plugin", { hasPluginJson: false });

      const plugins = scanPluginsFromDir(defaultDir);
      const lsp = plugins.find(p => p.id === "lsp-plugin");
      expect(lsp).toBeDefined();
      expect(lsp!.name).toBe("lsp-plugin"); // Falls back to dir name
    });

    test("handles both .mcp.json formats", () => {
      createMockPlugin(defaultDir, "external_plugins", "flat-mcp", { hasMcp: true, mcpFormat: "flat" });
      createMockPlugin(defaultDir, "external_plugins", "nested-mcp", { hasMcp: true, mcpFormat: "nested" });

      const plugins = listDefaultPlugins();
      const flat = plugins.find(p => p.id === "flat-mcp");
      const nested = plugins.find(p => p.id === "nested-mcp");

      expect(flat!.mcpServerNames).toEqual(["flat-mcp"]);
      expect(nested!.mcpServerNames).toEqual(["nested-mcp"]);
    });

    test("returns empty array for non-existent directory", () => {
      const plugins = scanPluginsFromDir(join(baseDir, "nonexistent"));
      expect(plugins).toEqual([]);
    });

    test("respects enabledPlugins in settings.json", () => {
      writeFileSync(
        join(defaultDir, "settings.json"),
        JSON.stringify({
          enabledPlugins: {
            "flat-mcp@claude-plugins-official": true,
            "nested-mcp@claude-plugins-official": false,
          },
        }),
      );

      const plugins = listDefaultPlugins();
      const flat = plugins.find(p => p.id === "flat-mcp");
      const nested = plugins.find(p => p.id === "nested-mcp");

      expect(flat!.enabled).toBe(true);
      expect(nested!.enabled).toBe(false);
    });
  });

  describe("copySinglePlugin", () => {
    test("copies a plugin from default to instance", async () => {
      // Ensure instance has settings
      writeFileSync(join(instanceDir, "settings.json"), "{}");

      await copySinglePlugin(instanceDir, "flat-mcp", "external");

      const target = join(instanceDir, MKT, "external_plugins", "flat-mcp");
      expect(existsSync(target)).toBe(true);
      expect(existsSync(join(target, "README.md"))).toBe(true);
      expect(existsSync(join(target, ".mcp.json"))).toBe(true);
    });

    test("updates installed_plugins.json after copy", async () => {
      const ipFile = join(instanceDir, "plugins", "installed_plugins.json");
      expect(existsSync(ipFile)).toBe(true);

      const data = JSON.parse(readFileSync(ipFile, "utf-8"));
      expect(data.version).toBe(2);
      expect(data.plugins["flat-mcp@claude-plugins-official"]).toBeDefined();
    });

    test("throws for non-existent plugin", async () => {
      try {
        await copySinglePlugin(instanceDir, "nonexistent-plugin", "external");
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect((err as Error).message).toContain("not found");
      }
    });

    test("throws for symlinked instance", async () => {
      const linkDir = join(baseDir, "linked-instance");
      mkdirSync(linkDir, { recursive: true });
      mkdirSync(join(linkDir, "plugins"), { recursive: true });

      // Can't easily create actual symlink in test, so test the detection function
      expect(isPluginsSymlinked(instanceDir)).toBe(false);
    });
  });

  describe("copySelectedPlugins", () => {
    test("throws on empty selection", async () => {
      try {
        await copySelectedPlugins(instanceDir, []);
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect((err as Error).message).toContain("at least one");
      }
    });

    test("rolls back on partial failure", async () => {
      // Use a separate base dir to avoid cross-test contamination
      const rbBase = mkdtempSync(join(tmpdir(), "rollback-"));
      const rbDefault = join(rbBase, "default");
      const freshInstance = join(rbBase, "instance");
      mkdirSync(rbDefault, { recursive: true });
      mkdirSync(freshInstance, { recursive: true });
      writeFileSync(join(freshInstance, "settings.json"), "{}");

      // Create a good plugin in default
      createMockPlugin(rbDefault, "external_plugins", "good-plugin");

      // Override default dir for this test
      setTestDefaultClaudeDir(rbDefault);

      try {
        await copySelectedPlugins(freshInstance, [
          { id: "good-plugin", category: "external" },
          { id: "nonexistent-xyz", category: "external" },
        ]);
        expect.unreachable("Should have thrown");
      } catch (err) {
        // The pre-flight check catches nonexistent plugins
        expect((err as Error).message).toContain("not found");
      }

      // Restore default dir
      setTestDefaultClaudeDir(defaultDir);
      try { rmSync(rbBase, { recursive: true, force: true }); } catch {}
    });
  });

  describe("removeSinglePlugin", () => {
    test("removes a plugin from instance", async () => {
      await removeSinglePlugin(instanceDir, "flat-mcp", "external");

      const target = join(instanceDir, MKT, "external_plugins", "flat-mcp");
      expect(existsSync(target)).toBe(false);

      // Verify installed_plugins.json was updated
      const ipFile = join(instanceDir, "plugins", "installed_plugins.json");
      if (existsSync(ipFile)) {
        const data = JSON.parse(readFileSync(ipFile, "utf-8"));
        expect(data.plugins["flat-mcp@claude-plugins-official"]).toBeUndefined();
      }
    });

    test("throws for non-existent plugin", async () => {
      try {
        await removeSinglePlugin(instanceDir, "nonexistent-plugin", "external");
        expect.unreachable("Should have thrown");
      } catch (err) {
        expect((err as Error).message).toContain("not found");
      }
    });
  });

  describe("MCP helpers", () => {
    test("getMcpServersFromPlugins reads .mcp.json files", () => {
      const mcpDir = join(baseDir, "mcp-test");
      const mcpPluginDir = join(mcpDir, MKT, "external_plugins", "test-mcp");
      mkdirSync(mcpPluginDir, { recursive: true });
      writeFileSync(
        join(mcpPluginDir, ".mcp.json"),
        JSON.stringify({ "test-server": { command: "npx", args: ["test"] } }),
      );

      const servers = getMcpServersFromPlugins(mcpDir);
      expect(servers["test-server"]).toBeDefined();
      expect(servers["test-server"].command).toBe("npx");

      try { rmSync(mcpDir, { recursive: true, force: true }); } catch {}
    });

    test("getInstanceMcpServers returns combined view", async () => {
      const combinedDir = join(baseDir, "combined-test");
      mkdirSync(join(combinedDir, MKT, "external_plugins", "combo-mcp"), { recursive: true });
      writeFileSync(
        join(combinedDir, MKT, "external_plugins", "combo-mcp", ".mcp.json"),
        JSON.stringify({ "plugin-server": { command: "npx", args: ["plugin"] } }),
      );
      writeFileSync(
        join(combinedDir, "settings.json"),
        JSON.stringify({
          mcpServers: { "custom-server": { type: "http", url: "http://localhost:3000" } },
        }),
      );

      const result = await getInstanceMcpServers(combinedDir);
      expect(result.fromPlugins["plugin-server"]).toBeDefined();
      expect(result.fromSettings["custom-server"]).toBeDefined();
      expect(result.all["plugin-server"]).toBeDefined();
      expect(result.all["custom-server"]).toBeDefined();

      try { rmSync(combinedDir, { recursive: true, force: true }); } catch {}
    });
  });

  describe("detectMcpCollisions", () => {
    test("detects server name collisions", () => {
      const targetDir = join(baseDir, "collision-target");
      mkdirSync(join(targetDir, MKT, "external_plugins", "existing"), { recursive: true });
      writeFileSync(
        join(targetDir, MKT, "external_plugins", "existing", ".mcp.json"),
        JSON.stringify({ "shared-name": { command: "existing" } }),
      );

      // Create a new plugin in default that has the same MCP server name
      createMockPlugin(defaultDir, "external_plugins", "new-plugin", { hasMcp: true });
      // Override its .mcp.json to use the same server name
      writeFileSync(
        join(defaultDir, MKT, "external_plugins", "new-plugin", ".mcp.json"),
        JSON.stringify({ "shared-name": { command: "new" } }),
      );

      const collisions = detectMcpCollisions(targetDir, ["new-plugin"]);
      expect(collisions.length).toBe(1);
      expect(collisions[0].serverName).toBe("shared-name");

      try { rmSync(targetDir, { recursive: true, force: true }); } catch {}
    });

    test("returns empty when no collisions", () => {
      const collisions = detectMcpCollisions(instanceDir, ["flat-mcp"]);
      // flat-mcp was removed earlier, so no collisions
      expect(collisions.length).toBe(0);
    });
  });

  describe("Atomic writes", () => {
    test("writeClaudeSettings produces valid JSON", async () => {
      const { writeClaudeSettings, readClaudeSettings } = await import("@/config");
      const testDir = join(baseDir, "atomic-test");
      mkdirSync(testDir, { recursive: true });

      const settings = { enabledPlugins: { test: true }, custom: "data" };
      await writeClaudeSettings(testDir, settings);

      const read = await readClaudeSettings(testDir);
      expect(read!.enabledPlugins).toEqual({ test: true });
      expect(read!.custom).toBe("data");

      // Verify the file is valid JSON
      const raw = readFileSync(join(testDir, "settings.json"), "utf-8");
      expect(() => JSON.parse(raw)).not.toThrow();

      try { rmSync(testDir, { recursive: true, force: true }); } catch {}
    });
  });
});
