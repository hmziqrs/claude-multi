import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

export interface TestEnvironment {
  homeDir: string;
  configDir: string;
  cleanup: () => Promise<void>;
}

export async function createTestEnv(): Promise<TestEnvironment> {
  const homeDir = await mkdtemp(join(tmpdir(), "claude-ink-test-"));
  const configDir = join(homeDir, ".claude-multi");

  await mkdir(configDir, { recursive: true });
  await writeFile(
    join(configDir, "config.json"),
    JSON.stringify({ version: "1.0.0", instances: [] }, null, 2),
  );

  // Create default .claude dir with settings
  const defaultClaudeDir = join(homeDir, ".claude");
  await mkdir(defaultClaudeDir, { recursive: true });
  await writeFile(
    join(defaultClaudeDir, "settings.json"),
    JSON.stringify({ includeCoAuthoredBy: false }, null, 2),
  );

  return {
    homeDir,
    configDir,
    cleanup: () => rm(homeDir, { recursive: true, force: true }),
  };
}

export async function createTestInstance(
  homeDir: string,
  name: string,
  configDir?: string,
) {
  const cDir = configDir || join(homeDir, `.claude-${name}`);
  await mkdir(cDir, { recursive: true });
  await writeFile(
    join(cDir, "settings.json"),
    JSON.stringify({ enabledPlugins: { test: true } }, null, 2),
  );

  return {
    name,
    configDir: cDir,
    binaryPath: join(homeDir, ".local", "bin", `claude-${name}`),
    createdAt: new Date().toISOString(),
    autoSync: true,
  };
}
