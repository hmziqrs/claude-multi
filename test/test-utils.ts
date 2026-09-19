import { mkdtempSync, rmSync, readlinkSync, existsSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { writeFile, mkdir, copyFile as cpFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTestDefaultClaudeDir, clearTestDefaultClaudeDir } from "@/config";

/**
 * Temp-dir fixture mimicking production layout:
 * <base>/.claude/{plugins,skills,settings.json} + <base>/instances/test-instance/
 */
export class AutoSyncTestHelper {
  private tempDirs: string[] = [];
  private baseTempDir: string | null = null;
  private defaultClaudeDir: string | null = null;
  private instanceConfigDir: string | null = null;

  createTempDir(prefix = "claude-multi-test-"): string {
    const tempDir = mkdtempSync(join(tmpdir(), prefix));
    this.tempDirs.push(tempDir);
    return tempDir;
  }

  async createMockDefaultClaudeDir(baseDir: string): Promise<string> {
    const defaultDir = join(baseDir, ".claude");

    const pluginsDir = join(defaultDir, "plugins");
    await mkdir(pluginsDir, { recursive: true });
    await writeFile(join(pluginsDir, "plugin1.json"), JSON.stringify({ name: "plugin1" }));
    await writeFile(join(pluginsDir, "plugin2.json"), JSON.stringify({ name: "plugin2" }));

    const nestedPluginDir = join(pluginsDir, "nested");
    await mkdir(nestedPluginDir, { recursive: true });
    await writeFile(join(nestedPluginDir, "nested-plugin.json"), JSON.stringify({ name: "nested" }));

    const skillsDir = join(defaultDir, "skills");
    await mkdir(skillsDir, { recursive: true });
    await writeFile(join(skillsDir, "skill1.ts"), "// skill1 content");
    await writeFile(join(skillsDir, "skill2.ts"), "// skill2 content");

    const settingsContent = {
      enabledPlugins: {
        plugin1: true,
        plugin2: false,
      },
      mcpServers: {
        test: {
          type: "stdio" as const,
          command: "test",
        },
      },
    };
    await writeFile(join(defaultDir, "settings.json"), JSON.stringify(settingsContent, null, 2));

    await writeFile(join(defaultDir, "config.json"), JSON.stringify({ test: "config" }));
    await writeFile(join(defaultDir, "history.jsonl"), "test history");

    await mkdir(join(defaultDir, "debug"), { recursive: true });
    await writeFile(join(defaultDir, "debug", "log.txt"), "debug log");

    await mkdir(join(defaultDir, "session-env"), { recursive: true });
    await mkdir(join(defaultDir, "todos"), { recursive: true });

    await writeFile(join(defaultDir, "custom-file.txt"), "custom content");

    this.defaultClaudeDir = defaultDir;
    return defaultDir;
  }

  createInstanceConfigDir(baseDir: string, instanceName = "test-instance"): string {
    const instancesDir = join(baseDir, "instances");
    const instanceDir = join(instancesDir, instanceName);
    mkdirSync(instanceDir, { recursive: true });
    this.instanceConfigDir = instanceDir;
    return instanceDir;
  }

  async setup(): Promise<{
    defaultClaudeDir: string;
    instanceConfigDir: string;
  }> {
    const baseDir = this.createTempDir("claude-multi-base-");
    this.baseTempDir = baseDir;

    const defaultClaudeDir = await this.createMockDefaultClaudeDir(baseDir);

    // Production keeps instances at ~/.claude-multi/instances/<name>/; tests nest
    // instances/ under baseDir because the default Claude dir is overridden.
    const instanceConfigDir = this.createInstanceConfigDir(baseDir);

    setTestDefaultClaudeDir(defaultClaudeDir);

    return { defaultClaudeDir, instanceConfigDir };
  }

  cleanupDir(dir: string): void {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  cleanup(): void {
    for (const dir of this.tempDirs) {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
      }
    }
    this.tempDirs = [];

    clearTestDefaultClaudeDir();
  }

  teardown(): void {
    this.cleanup();
  }

  assertSymlink(path: string): void {
    if (!existsSync(path)) {
      throw new Error(`Expected symlink does not exist: ${path}`);
    }
    try {
      readlinkSync(path);
    } catch {
      throw new Error(`Path exists but is not a symlink: ${path}`);
    }
  }

  assertRegularDirectory(path: string): void {
    if (!existsSync(path)) {
      throw new Error(`Expected directory does not exist: ${path}`);
    }
    try {
      readlinkSync(path);
      throw new Error(`Path exists but is a symlink, not a regular directory: ${path}`);
    } catch {
    }
    const stat = statSync(path);
    if (!stat.isDirectory()) {
      throw new Error(`Path exists but is not a directory: ${path}`);
    }
  }

  assertNotExists(path: string): void {
    if (existsSync(path)) {
      throw new Error(`Path should not exist: ${path}`);
    }
  }

  assertExists(path: string): void {
    if (!existsSync(path)) {
      throw new Error(`Expected path does not exist: ${path}`);
    }
  }

  getFilesRecursive(dir: string): string[] {
    const files: string[] = [];
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursive(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  countFiles(dir: string): number {
    return this.getFilesRecursive(dir).length;
  }

  async readFile(path: string): Promise<string> {
    const { readFile } = await import("node:fs/promises");
    return readFile(path, "utf-8");
  }

  async createFile(path: string, content: string): Promise<void> {
    await writeFile(path, content, "utf-8");
  }

  async createDirectory(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  }

  async copyFile(source: string, target: string): Promise<void> {
    await cpFile(source, target);
  }

  getDefaultClaudeDir(): string | null {
    return this.defaultClaudeDir;
  }

  getInstanceConfigDir(): string | null {
    return this.instanceConfigDir;
  }
}
