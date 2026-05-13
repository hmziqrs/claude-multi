import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { execa } from "execa";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("E2E: Full Instance Lifecycle", () => {
  let testHome: string;

  beforeAll(async () => {
    testHome = await mkdtemp(join(tmpdir(), "claude-e2e-"));
  });

  afterAll(async () => {
    await rm(testHome, { recursive: true, force: true });
  });

  const runCli = (args: string[]) =>
    execa({
      env: { HOME: testHome, PATH: process.env.PATH || "" },
      reject: false,
    })`bun run src/cli.ts ${args}`;

  it("add -> list -> info -> remove flow", async () => {
    // 1. Add instance
    const addResult = await runCli(["add", "lifecycle-test", "--skip-prompts"]);
    expect(addResult.exitCode).toBe(0);
    expect(addResult.stdout).toContain("created successfully");

    // 2. List - should show it
    const listResult = await runCli(["list"]);
    expect(listResult.stdout).toContain("lifecycle-test");
    expect(listResult.stdout).toContain("1 instance");

    // 3. Info - should show details
    const infoResult = await runCli(["info", "lifecycle-test"]);
    expect(infoResult.stdout).toContain("lifecycle-test");
    expect(infoResult.stdout).toContain("Auto-sync");

    // 4. Remove
    const removeResult = await runCli(["remove", "lifecycle-test", "--force"]);
    expect(removeResult.stdout).toContain("removed successfully");

    // 5. Verify gone
    const finalList = await runCli(["list"]);
    expect(finalList.stdout).toContain("No instances found");
  });

  it("add with provider template", async () => {
    const { stdout, exitCode } = await runCli([
      "add", "glm-test",
      "--provider", "glm",
      "--api-key", "test-key-123",
      "--skip-prompts",
    ]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("created successfully");

    // Cleanup
    await runCli(["remove", "glm-test", "--force"]);
  });

  it("fails on duplicate instance", async () => {
    await runCli(["add", "dup-test", "--skip-prompts"]);
    const { exitCode } = await runCli(["add", "dup-test", "--skip-prompts"]);
    expect(exitCode).not.toBe(0);

    // Cleanup
    await runCli(["remove", "dup-test", "--force"]);
  });

  it("fails on invalid provider", async () => {
    const { exitCode, stderr } = await runCli([
      "add", "bad-provider",
      "--provider", "nonexistent",
      "--api-key", "test",
    ]);
    expect(exitCode).not.toBe(0);
  });

  it("auto-sync toggle", async () => {
    await runCli(["add", "sync-test", "--skip-prompts"]);

    // Turn off
    const offResult = await runCli(["auto-sync", "sync-test", "off"]);
    expect(offResult.stdout).toContain("disabled");

    // Turn on
    const onResult = await runCli(["auto-sync", "sync-test", "on"]);
    expect(onResult.stdout).toContain("enabled");

    // Cleanup
    await runCli(["remove", "sync-test", "--force"]);
  });
});
