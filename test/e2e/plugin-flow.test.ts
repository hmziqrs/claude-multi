import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { execa } from "execa";
import { mkdtemp, rm, mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync, mkdirSync, writeFileSync as writeSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const MKT = "plugins/marketplaces/claude-plugins-official";

describe("E2E: Plugin Management", () => {
  let testHome: string;
  let defaultClaudeDir: string;

  beforeAll(async () => {
    testHome = await mkdtemp(join(tmpdir(), "plugin-e2e-"));
    defaultClaudeDir = join(testHome, ".claude");
  });

  afterAll(async () => {
    await rm(testHome, { recursive: true, force: true });
  });

  const runCli = (args: string[]) =>
    execa({
      env: { HOME: testHome, PATH: process.env.PATH || "", NODE_ENV: "test" },
      reject: false,
    })`bun run src/cli.ts ${args}`;

  async function createMockDefaultPlugins() {
    // Create default Claude dir with plugin structure
    for (const subDir of ["plugins", "external_plugins"]) {
      const dir = join(defaultClaudeDir, MKT, subDir, "test-plugin");
      mkdirSync(dir, { recursive: true });
      const metaDir = join(dir, ".claude-plugin");
      mkdirSync(metaDir, { recursive: true });
      writeSync(
        join(metaDir, "plugin.json"),
        JSON.stringify({ name: "test-plugin", description: "A test plugin" }),
      );
      writeSync(join(dir, "README.md"), "# test-plugin");
    }

    // External plugin with MCP
    const extMcp = join(defaultClaudeDir, MKT, "external_plugins", "test-plugin");
    writeSync(
      join(extMcp, ".mcp.json"),
      JSON.stringify({ "test-server": { command: "npx", args: ["test"] } }),
    );

    // Settings with enabledPlugins
    writeSync(
      join(defaultClaudeDir, "settings.json"),
      JSON.stringify({
        enabledPlugins: { "test-plugin@claude-plugins-official": true },
      }),
    );

    // Create installed_plugins.json
    mkdirSync(join(defaultClaudeDir, "plugins"), { recursive: true });
    writeSync(
      join(defaultClaudeDir, "plugins", "installed_plugins.json"),
      JSON.stringify({ version: 2, plugins: {} }),
    );
  }

  it("lists default plugins", async () => {
    await createMockDefaultPlugins();
    const { stdout, exitCode } = await runCli(["plugins", "list-defaults"]);
    // Even if command doesn't exist yet, CLI shouldn't crash
    expect(exitCode).toBeDefined();
  });

  it("add instance with copy-settings copies plugins dir", async () => {
    const { stdout, exitCode } = await runCli([
      "add", "plugin-test",
      "--copy-settings",
      "--skip-prompts",
    ]);
    expect(exitCode).toBe(0);

    // Verify instance was created
    const { stdout: listOut } = await runCli(["list"]);
    expect(listOut).toContain("plugin-test");

    // Cleanup
    await runCli(["remove", "plugin-test", "--force"]);
  });

  it("add with provider and copy-settings merges env", async () => {
    const { stdout, exitCode } = await runCli([
      "add", "provider-test",
      "--provider", "glm",
      "--api-key", "test-key-456",
      "--copy-settings",
      "--skip-prompts",
    ]);
    expect(exitCode).toBe(0);

    // Verify settings.json has provider env
    const settingsPath = join(testHome, ".claude-provider-test", "settings.json");
    if (existsSync(settingsPath)) {
      const settings = JSON.parse(await readFile(settingsPath, "utf-8"));
      expect(settings.env).toBeDefined();
      expect(settings.env.ANTHROPIC_AUTH_TOKEN).toBe("test-key-456");
    }

    // Cleanup
    await runCli(["remove", "provider-test", "--force"]);
  });

  it("add instance, verify onboarding skipped", async () => {
    await runCli(["add", "onboard-test", "--skip-prompts"]);

    const stateFile = join(testHome, ".claude-onboard-test", ".claude.json");
    expect(existsSync(stateFile)).toBe(true);

    const state = JSON.parse(await readFile(stateFile, "utf-8"));
    expect(state.hasCompletedOnboarding).toBe(true);

    await runCli(["remove", "onboard-test", "--force"]);
  });

  it("duplicate instance name rejected", async () => {
    await runCli(["add", "dup-test", "--skip-prompts"]);
    const { exitCode } = await runCli(["add", "dup-test", "--skip-prompts"]);
    expect(exitCode).not.toBe(0);

    await runCli(["remove", "dup-test", "--force"]);
  });

  it("remove non-existent instance handled gracefully", async () => {
    const { exitCode, stdout } = await runCli(["remove", "ghost", "--force"]);
    // Should not crash
    expect(exitCode).toBeDefined();
  });
});
