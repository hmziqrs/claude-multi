import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface Instance {
  name: string;
  configDir: string;
  binaryPath: string;
  createdAt: string;
}

export interface Config {
  instances: Instance[];
  version: string;
}

const CONFIG_DIR = join(homedir(), ".claude-multi");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export async function loadConfig(): Promise<Config> {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    const defaultConfig: Config = {
      instances: [],
      version: "1.0.0",
    };
    await saveConfig(defaultConfig);
    return defaultConfig;
  }

  const content = await readFile(CONFIG_FILE, "utf-8");
  return JSON.parse(content) as Config;
}

export async function saveConfig(config: Config): Promise<void> {
  ensureConfigDir();
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export async function addInstance(instance: Instance): Promise<void> {
  const config = await loadConfig();

  // Check if instance already exists
  const existing = config.instances.find((i) => i.name === instance.name);
  if (existing) {
    throw new Error(`Instance '${instance.name}' already exists`);
  }

  config.instances.push(instance);
  await saveConfig(config);
}

export async function removeInstance(name: string): Promise<Instance | null> {
  const config = await loadConfig();
  const index = config.instances.findIndex((i) => i.name === name);

  if (index === -1) {
    return null;
  }

  const [removed] = config.instances.splice(index, 1);
  await saveConfig(config);
  return removed;
}

export async function getInstance(name: string): Promise<Instance | null> {
  const config = await loadConfig();
  return config.instances.find((i) => i.name === name) ?? null;
}

export async function listInstances(): Promise<Instance[]> {
  const config = await loadConfig();
  return config.instances;
}
