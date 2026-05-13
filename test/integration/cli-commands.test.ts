import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { execa } from "execa";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("CLI Integration", () => {
  let testHome: string;

  beforeAll(async () => {
    testHome = await mkdtemp(join(tmpdir(), "claude-multi-test-"));
    const configDir = join(testHome, ".claude-multi");
    await mkdir(configDir, { recursive: true });
    await writeFile(
      join(configDir, "config.json"),
      JSON.stringify({ version: "1.0.0", instances: [] }, null, 2),
    );
  });

  afterAll(async () => {
    await rm(testHome, { recursive: true, force: true });
  });

  const runCli = (args: string[]) =>
    execa({
      env: { HOME: testHome, PATH: process.env.PATH || "" },
      reject: false,
    })`bun run src/cli.ts ${args}`;

  it("shows version", async () => {
    const { stdout } = await runCli(["--version"]);
    expect(stdout).toContain("0.4.0");
  });

  it("shows help", async () => {
    const { stdout } = await runCli(["--help"]);
    expect(stdout).toContain("Manage multiple Claude Code instances");
    expect(stdout).toContain("add");
    expect(stdout).toContain("remove");
    expect(stdout).toContain("list");
    expect(stdout).toContain("interactive");
  });

  it("lists empty instances", async () => {
    const { stdout } = await runCli(["list"]);
    expect(stdout).toContain("No instances found");
  });

  it("adds and lists an instance", async () => {
    const { stdout: addOut, exitCode } = await runCli([
      "add", "test-inst", "--skip-prompts",
    ]);
    expect(exitCode).toBe(0);
    expect(addOut).toContain("created successfully");

    const { stdout: listOut } = await runCli(["list"]);
    expect(listOut).toContain("test-inst");
  });

  it("shows instance info", async () => {
    const { stdout } = await runCli(["info", "test-inst"]);
    expect(stdout).toContain("test-inst");
  });

  it("removes an instance", async () => {
    const { stdout, exitCode } = await runCli([
      "remove", "test-inst", "--force",
    ]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("removed successfully");

    const { stdout: listOut } = await runCli(["list"]);
    expect(listOut).toContain("No instances found");
  });

  it("errors on unknown command", async () => {
    const { exitCode } = await runCli(["unknown"]);
    expect(exitCode).not.toBe(0);
  });

  it("errors on missing instance for info", async () => {
    const { exitCode } = await runCli(["info", "nonexistent"]);
    expect(exitCode).not.toBe(0);
  });
});
