import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getProviderTemplate, resolveRegionTemplate } from "@/templates";

const root = mkdtempSync(join(tmpdir(), "claude-multi-templates-"));
const home = join(root, "home");
const fakeClaude = join(root, "bin", process.platform === "win32" ? "claude.cmd" : "claude");

const cases = [
  { name: "glm", provider: "glm", apiKey: "sk-test-glm" },
  { name: "minimax", provider: "minimax", apiKey: "sk-test-minimax" },
  { name: "deepseek", provider: "deepseek", apiKey: "sk-test-deepseek" },
  { name: "mimo", provider: "mimo", apiKey: "sk-test-mimo" },
  { name: "mimo-token", provider: "mimo-token", apiKey: "tp-test-mimo", region: "sgp" },
  { name: "kimi", provider: "kimi", apiKey: "sk-test-kimi" },
  { name: "qwen", provider: "qwen", apiKey: "sk-test-qwen" },
  { name: "qwen-coding", provider: "qwen-coding", apiKey: "sk-test-qwen-coding" },
] as const;

beforeAll(() => {
  mkdirSync(home, { recursive: true });
  mkdirSync(join(root, "bin"), { recursive: true });
  writeFileSync(
    fakeClaude,
    process.platform === "win32" ? "@echo off\r\nexit /b 0\r\n" : "#!/bin/sh\nexit 0\n",
    { mode: 0o755 },
  );
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("provider template CLI smoke test", () => {
  for (const testCase of cases) {
    test(`creates ${testCase.name} with the shipped template`, async () => {
      const configDir = join(root, `inst-${testCase.name}`);
      const binaryPath = join(root, "wrappers", `claude-${testCase.name}`);
      const command = [
        process.execPath,
        "run",
        "src/cli.ts",
        "add",
        testCase.name,
        "--provider",
        testCase.provider,
        "--api-key",
        testCase.apiKey,
        "--skip-prompts",
        "--config",
        configDir,
        "--binary",
        binaryPath,
      ];
      if ("region" in testCase) {
        command.push("--region", testCase.region);
      }

      const proc = Bun.spawn({
        cmd: command,
        cwd: process.cwd(),
        env: {
          ...process.env,
          HOME: home,
          USERPROFILE: home,
          CLAUDE_MULTI_HOME: home,
          CLAUDE_MULTI_CLAUDE_PATH: fakeClaude,
          CLAUDE_MULTI_INK: "false",
          NO_COLOR: "1",
        },
        stdout: "pipe",
        stderr: "pipe",
      });

      const [exitCode, stdout, stderr] = await Promise.all([
        proc.exited,
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
      ]);

      expect(
        exitCode,
        `CLI failed for ${testCase.name}\nstdout:\n${stdout}\nstderr:\n${stderr}`,
      ).toBe(0);
      expect(existsSync(join(configDir, "settings.json"))).toBe(true);
      expect(existsSync(binaryPath)).toBe(true);

      const settings = JSON.parse(readFileSync(join(configDir, "settings.json"), "utf-8")) as {
        env: Record<string, string>;
      };
      const template = getProviderTemplate(testCase.provider)!;
      const resolved =
        "region" in testCase
          ? resolveRegionTemplate(template, testCase.region)
          : template;
      const expected = resolved.settings.env;

      for (const [key, value] of Object.entries(expected)) {
        if (key === "ANTHROPIC_AUTH_TOKEN") continue;
        expect(settings.env[key], `${testCase.name} ${key}`).toBe(value);
      }
      expect(settings.env.ANTHROPIC_AUTH_TOKEN).toBe(testCase.apiKey);

      for (const key of [
        "MAX_OUTPUT_TOKENS",
        "ANTHROPIC_SMALL_FAST_MODEL",
        "ENABLE_THINKING",
        "REASONING_EFFORT",
        "ENABLE_STREAMING",
      ]) {
        expect(settings.env[key], `${testCase.name} should not write ${key}`).toBeUndefined();
      }

      const wrapper = readFileSync(binaryPath, "utf-8");
      expect(wrapper).toContain(configDir);

      const registry = JSON.parse(
        readFileSync(join(home, ".claude-multi", "config.json"), "utf-8"),
      ) as {
        instances: Array<{ name: string; providerTemplate?: string; providerRegion?: string }>;
      };
      const instance = registry.instances.find((entry) => entry.name === testCase.name);
      expect(instance?.providerTemplate).toBe(testCase.provider);
      if ("region" in testCase) {
        expect(instance?.providerRegion).toBe(testCase.region);
      }
    });
  }
});
