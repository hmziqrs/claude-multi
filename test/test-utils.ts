import { mkdtempSync, rmSync, readlinkSync, existsSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { writeFile, mkdir, copyFile as cpFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTestDefaultClaudeDir, clearTestDefaultClaudeDir } from "@/config";

/**
 * Test helper for auto-sync functionality tests
 * Provides isolated temp directory management for testing file system operations
 *
 * Creates a directory structure that mimics production:
 * baseTempDir/
 *   .claude/              (default Claude directory)
 *     plugins/
 *     skills/
 *     settings.json
 *   instances/
 *     test-instance/      (instance config directory)
 */
export class AutoSyncTestHelper {
  private tempDirs: string[] = [];
  private baseTempDir: string | null = null;
  private defaultClaudeDir: string | null = null;
  private instanceConfigDir: string | null = null;

  /**
   * Create a new temporary directory
   */
  createTempDir(prefix = "claude-multi-test-"): string {
    const tempDir = mkdtempSync(join(tmpdir(), prefix));
    this.tempDirs.push(tempDir);
    return tempDir;
  }

  /**
   * Create a mock default Claude directory with test files
   */
  async createMockDefaultClaudeDir(baseDir: string): Promise<string> {
    const defaultDir = join(baseDir, ".claude");

    // Create plugins directory with test plugins
    const pluginsDir = join(defaultDir, "plugins");
    await mkdir(pluginsDir, { recursive: true });
    await writeFile(join(pluginsDir, "plugin1.json"), JSON.stringify({ name: "plugin1" }));
    await writeFile(join(pluginsDir, "plugin2.json"), JSON.stringify({ name: "plugin2" }));

    // Create nested structure in plugins
    const nestedPluginDir = join(pluginsDir, "nested");
    await mkdir(nestedPluginDir, { recursive: true });
    await writeFile(join(nestedPluginDir, "nested-plugin.json"), JSON.stringify({ name: "nested" }));

    // Create skills directory with test skills
    const skillsDir = join(defaultDir, "skills");
    await mkdir(skillsDir, { recursive: true });
    await writeFile(join(skillsDir, "skill1.ts"), "// skill1 content");
    await writeFile(join(skillsDir, "skill2.ts"), "// skill2 content");

    // Create settings.json
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

    // Create some excluded files to test they're not copied
    await writeFile(join(defaultDir, "config.json"), JSON.stringify({ test: "config" }));
    await writeFile(join(defaultDir, "history.jsonl"), "test history");

    // Create some directories to exclude
    await mkdir(join(defaultDir, "debug"), { recursive: true });
    await writeFile(join(defaultDir, "debug", "log.txt"), "debug log");

    await mkdir(join(defaultDir, "session-env"), { recursive: true });
    await mkdir(join(defaultDir, "todos"), { recursive: true });

    // Create a regular file to copy (not excluded)
    await writeFile(join(defaultDir, "custom-file.txt"), "custom content");

    this.defaultClaudeDir = defaultDir;
    return defaultDir;
  }

  /**
   * Create a mock instance config directory
   */
  createInstanceConfigDir(baseDir: string, instanceName = "test-instance"): string {
    const instancesDir = join(baseDir, "instances");
    const instanceDir = join(instancesDir, instanceName);
    mkdirSync(instanceDir, { recursive: true });
    this.instanceConfigDir = instanceDir;
    return instanceDir;
  }

  /**
   * Set up test environment with mock directories
   */
  async setup(): Promise<{
    defaultClaudeDir: string;
    instanceConfigDir: string;
  }> {
    // Create a base temp directory to simulate the user's home directory
    const baseDir = this.createTempDir("claude-multi-base-");
    this.baseTempDir = baseDir;

    // Create .claude directory (default Claude dir)
    const defaultClaudeDir = await this.createMockDefaultClaudeDir(baseDir);

    // Create instance config directory at instances/test-instance/
    // This structure mimics production where instances are at ~/.claude-multi/instances/<name>/
    // But for tests, we use baseDir/instances/ since we override the default Claude dir
    const instanceConfigDir = this.createInstanceConfigDir(baseDir);

    // Set the test override for default Claude directory
    setTestDefaultClaudeDir(defaultClaudeDir);

    return { defaultClaudeDir, instanceConfigDir };
  }

  /**
   * Clean up a specific directory
   */
  cleanupDir(dir: string): void {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  /**
   * Clean up all temporary directories
   */
  cleanup(): void {
    for (const dir of this.tempDirs) {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        // Ignore errors during cleanup
      }
    }
    this.tempDirs = [];

    // Clear the test override
    clearTestDefaultClaudeDir();
  }

  /**
   * Tear down the test helper (alias for cleanup)
   */
  teardown(): void {
    this.cleanup();
  }

  /**
   * Assert that a path exists and is a symlink
   */
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

  /**
   * Assert that a path exists and is a regular directory (not a symlink)
   */
  assertRegularDirectory(path: string): void {
    if (!existsSync(path)) {
      throw new Error(`Expected directory does not exist: ${path}`);
    }
    try {
      readlinkSync(path);
      throw new Error(`Path exists but is a symlink, not a regular directory: ${path}`);
    } catch {
      // Expected - not a symlink
    }
    const stat = statSync(path);
    if (!stat.isDirectory()) {
      throw new Error(`Path exists but is not a directory: ${path}`);
    }
  }

  /**
   * Assert that a path does not exist
   */
  assertNotExists(path: string): void {
    if (existsSync(path)) {
      throw new Error(`Path should not exist: ${path}`);
    }
  }

  /**
   * Assert that a path exists
   */
  assertExists(path: string): void {
    if (!existsSync(path)) {
      throw new Error(`Expected path does not exist: ${path}`);
    }
  }

  /**
   * Get all files in a directory recursively
   */
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

  /**
   * Count files in a directory recursively
   */
  countFiles(dir: string): number {
    return this.getFilesRecursive(dir).length;
  }

  /**
   * Read file content
   */
  async readFile(path: string): Promise<string> {
    const { readFile } = await import("node:fs/promises");
    return readFile(path, "utf-8");
  }

  /**
   * Create a test file with content
   */
  async createFile(path: string, content: string): Promise<void> {
    await writeFile(path, content, "utf-8");
  }

  /**
   * Create a test directory
   */
  async createDirectory(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  }

  /**
   * Copy a file for testing
   */
  async copyFile(source: string, target: string): Promise<void> {
    await cpFile(source, target);
  }

  /**
   * Get the default Claude directory
   */
  getDefaultClaudeDir(): string | null {
    return this.defaultClaudeDir;
  }

  /**
   * Get the instance config directory
   */
  getInstanceConfigDir(): string | null {
    return this.instanceConfigDir;
  }
}

/**
 * Create a symlink for testing (handles platform differences)
 */
export async function createSymlink(target: string, path: string): Promise<void> {
  const { symlink } = await import("node:fs/promises");
  await symlink(target, path, "dir");
}

/**
 * Check if a path is a symlink
 */
export function isSymlink(path: string): boolean {
  try {
    readlinkSync(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get relative path from source to target
 */
export async function getRelativePath(from: string, to: string): Promise<string> {
  const { relative } = await import("node:path");
  return relative(from, to);
}
