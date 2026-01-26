#!/usr/bin/env bun

import { Command } from "commander";
import chalk from "chalk";
import prompts from "prompts";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  addInstance,
  removeInstance,
  listInstances,
  getInstance,
  hasDefaultClaudeConfig,
  hasDefaultMcpConfig,
  copySettingsFromDefault,
  copyAllFromDefault,
  copyMcpServersFromDefault,
  copyMcpServersBetweenInstances,
  listMcpServers,
  createSettingsFromTemplate,
  updateInstanceAutoSync,
  syncPluginsAndSkills,
  unsyncPluginsAndSkills,
  detectBrokenSymlinks,
  getEnabledPlugins,
  setEnabledPlugins,
  enablePlugin,
  disablePlugin,
  listAvailablePlugins,
  type Instance,
} from "./config.ts";
import {
  createWrapper,
  removeWrapper,
  getDefaultBinaryPath,
} from "./wrapper.ts";
import {
  checkForUpdates,
  updateClaudeCode,
  getCurrentVersion,
  checkForClaudeMultiUpdates,
  upgradeClaudeMulti,
} from "./version.ts";
import { getAvailableProviders, getProviderTemplate } from "./templates.ts";

const program = new Command();

program
  .name("claude-multi")
  .description("Manage multiple Claude Code instances with different aliases")
  .version("0.4.0");

// Add command
program
  .command("add <name>")
  .description("Add a new Claude Code instance")
  .option("-c, --config <dir>", "Config directory path", (name: string) =>
    join(homedir(), `.claude-${name}`),
  )
  .option(
    "-b, --binary <path>",
    "Binary path (default: ~/.local/bin/claude-<name>)",
  )
  .option("--copy-settings", "Copy settings.json from default Claude")
  .option("--copy-all", "Copy all files from default Claude")
  .option("--copy-mcp", "Copy MCP server configurations from default Claude")
  .option("--skip-prompts", "Skip interactive prompts (start fresh)")
  .option("--provider <name>", "Use a provider template (glm, minimax)")
  .option("--api-key <key>", "API key for the provider")
  .option("--auto-sync", "Auto-sync plugins/skills via symlinks (default)")
  .option("--manual", "Manually manage plugins/skills (copy files)")
  .action(
    async (
      name: string,
      options: {
        config?: string;
        binary?: string;
        copySettings?: boolean;
        copyAll?: boolean;
        copyMcp?: boolean;
        skipPrompts?: boolean;
        provider?: string;
        apiKey?: string;
        autoSync?: boolean;
        manual?: boolean;
      },
    ) => {
      try {
        const configDir = options.config || join(homedir(), `.claude-${name}`);
        const binaryPath = options.binary || getDefaultBinaryPath(name);

        // Check if default Claude config exists
        const hasDefaultConfig = hasDefaultClaudeConfig();
        const hasDefaultMcp = await hasDefaultMcpConfig();

        let copySettings = false;
        let copyAllFiles = false;
        let copyMcpServers = false;
        let useProviderTemplate = false;
        let providerTemplate: any = null;
        let apiKey = "";
        // Default to auto-sync enabled
        let autoSync = !options.manual;

        // Handle provider template in CLI mode
        if (options.provider) {
          providerTemplate = getProviderTemplate(options.provider);
          if (!providerTemplate) {
            console.error(
              chalk.red(
                `✗ Unknown provider '${options.provider}'. Available: glm, minimax`,
              ),
            );
            process.exit(1);
          }

          if (!options.apiKey) {
            console.error(
              chalk.red("✗ --api-key is required when using --provider"),
            );
            process.exit(1);
          }

          apiKey = options.apiKey;
          useProviderTemplate = true;
        }

        // Non-interactive mode (flags provided)
        if (
          options.copySettings ||
          options.copyAll ||
          options.copyMcp ||
          options.skipPrompts ||
          options.provider
        ) {
          if (options.copyAll) {
            copyAllFiles = true;
            copySettings = true;
          } else if (options.copySettings) {
            copySettings = true;
          } else if (options.copyMcp) {
            copyMcpServers = true;
          }
          // skipPrompts means start fresh (both false)
        } else if (hasDefaultConfig || hasDefaultMcp) {
          // Interactive mode
          console.log(
            chalk.gray(
              "\nFound existing Claude Code configuration at ~/.claude",
            ),
          );

          const choices = [{ title: "Nothing - start fresh", value: "none" }];

          if (hasDefaultConfig) {
            choices.push({ title: "Only settings.json", value: "settings" });
          }

          if (hasDefaultMcp) {
            choices.push({ title: "Only MCP servers", value: "mcp" });
          }

          if (hasDefaultConfig && hasDefaultMcp) {
            choices.push({
              title: "Settings + MCP servers",
              value: "settings+mcp",
            });
          }

          if (hasDefaultConfig) {
            choices.push({
              title: "All files (settings, CLAUDE.md, plugins, etc.)",
              value: "all",
            });
          }

          const response = await prompts([
            {
              type: "select",
              name: "copyOption",
              message: "What would you like to copy from default Claude?",
              choices,
              initial: 1,
            },
          ]);

          // Handle Ctrl+C
          if (response.copyOption === undefined) {
            console.log(chalk.yellow("\n✗ Cancelled"));
            process.exit(0);
          }

          copySettings =
            response.copyOption === "settings" ||
            response.copyOption === "settings+mcp" ||
            response.copyOption === "all";
          copyMcpServers =
            response.copyOption === "mcp" ||
            response.copyOption === "settings+mcp" ||
            response.copyOption === "all";
          copyAllFiles = response.copyOption === "all";
        }

        const instance: Instance = {
          name,
          configDir,
          binaryPath,
          createdAt: new Date().toISOString(),
          autoSync,
        };

        await addInstance(instance);
        await createWrapper(instance);

        // Copy files if requested
        if (copySettings && !copyAllFiles) {
          await copySettingsFromDefault(configDir);
          console.log(chalk.green("✓ Copied settings.json"));
        }

        if (copyMcpServers && !copyAllFiles) {
          try {
            await copyMcpServersFromDefault(configDir);
            console.log(chalk.green("✓ Copied MCP server configurations"));
          } catch (error) {
            console.log(
              chalk.yellow(`⚠ Warning: ${(error as Error).message}`),
            );
          }
        }

        if (copyAllFiles) {
          await copyAllFromDefault(configDir, autoSync);
          if (autoSync) {
            console.log(chalk.green("✓ Copied all files with auto-sync (plugins/skills symlinked)"));
          } else {
            console.log(chalk.green("✓ Copied all files from default Claude (manual mode)"));
          }
        }

        // Apply provider template if selected (but not if copying settings)
        if (
          useProviderTemplate &&
          providerTemplate &&
          !copySettings &&
          !copyAllFiles
        ) {
          await createSettingsFromTemplate(configDir, providerTemplate, apiKey);
          console.log(
            chalk.green(`✓ Applied ${providerTemplate.displayName} template`),
          );
        } else if (useProviderTemplate && (copySettings || copyAllFiles)) {
          console.log(
            chalk.yellow(
              "⚠ Provider template skipped (copied settings from default Claude)",
            ),
          );
        }

        console.log(
          chalk.green(`\n✓ Instance '${name}' created successfully!`),
        );
        console.log(chalk.gray(`  Binary: ${binaryPath}`));
        console.log(chalk.gray(`  Config: ${configDir}`));
        console.log();

        // Check if binary directory is in PATH
        const binDir = binaryPath.substring(0, binaryPath.lastIndexOf("/"));
        const pathEnv = process.env.PATH || "";
        const isInPath = pathEnv.split(":").some((p) => p === binDir);

        if (!isInPath) {
          console.log(
            chalk.yellow(`⚠ Warning: ${binDir} is not in your PATH`),
          );
          console.log(chalk.gray(`Add to PATH by running:`));
          console.log(
            chalk.cyan(
              `  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc`,
            ),
          );
          console.log(chalk.cyan(`  source ~/.zshrc`));
          console.log();
          console.log(chalk.gray(`Or run directly: ${binaryPath} --help`));
        } else {
          console.log(chalk.cyan(`Run: claude-${name} --help`));
        }
      } catch (error) {
        console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
        process.exit(1);
      }
    },
  );

// Remove command
program
  .command("remove <name>")
  .alias("rm")
  .description("Remove a Claude Code instance")
  .option("-f, --force", "Skip confirmation prompt")
  .action(async (name: string, options: { force?: boolean }) => {
    try {
      const instance = await getInstance(name);
      if (!instance) {
        console.error(chalk.red(`✗ Instance '${name}' not found`));
        process.exit(1);
      }

      if (!options.force) {
        console.log(chalk.yellow(`About to remove instance '${name}':`));
        console.log(chalk.gray(`  Binary: ${instance.binaryPath}`));
        console.log(chalk.gray(`  Config: ${instance.configDir}`));
        console.log();
        console.log(
          chalk.yellow(
            "Note: Config directory will NOT be deleted automatically.",
          ),
        );
        console.log(
          chalk.gray(
            "Run with --force to skip this confirmation, or Ctrl+C to cancel.",
          ),
        );
        console.log();
      }

      await removeInstance(name);
      removeWrapper(instance.binaryPath);

      console.log(chalk.green(`✓ Instance '${name}' removed successfully!`));
      console.log();
      console.log(
        chalk.gray(`To remove config files, run: rm -rf ${instance.configDir}`),
      );
    } catch (error) {
      console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// List command
program
  .command("list")
  .alias("ls")
  .description("List all Claude Code instances")
  .action(async () => {
    try {
      const instances = await listInstances();

      if (instances.length === 0) {
        console.log(chalk.yellow("No instances found."));
        console.log();
        console.log(chalk.gray("Create one with: claude-multi add <name>"));
        return;
      }

      console.log(chalk.bold(`Found ${instances.length} instance(s):\n`));

      for (const instance of instances) {
        console.log(chalk.cyan(`● ${instance.name}`));
        console.log(chalk.gray(`  Binary:  ${instance.binaryPath}`));
        console.log(chalk.gray(`  Config:  ${instance.configDir}`));
        console.log(
          chalk.gray(
            `  Created: ${new Date(instance.createdAt).toLocaleString()}`,
          ),
        );
        const autoSyncStatus = instance.autoSync !== false ? chalk.green("on") : chalk.yellow("off");
        console.log(chalk.gray(`  Auto-sync: ${autoSyncStatus}`));
        console.log();
      }
    } catch (error) {
      console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Info command
program
  .command("info <name>")
  .description("Show details about a specific instance")
  .action(async (name: string) => {
    try {
      const instance = await getInstance(name);

      if (!instance) {
        console.error(chalk.red(`✗ Instance '${name}' not found`));
        process.exit(1);
      }

      console.log(chalk.bold(`Instance: ${chalk.cyan(instance.name)}\n`));
      console.log(`${chalk.gray("Binary:")}  ${instance.binaryPath}`);
      console.log(`${chalk.gray("Config:")}  ${instance.configDir}`);
      console.log(
        `${chalk.gray("Created:")} ${new Date(instance.createdAt).toLocaleString()}`,
      );
      const autoSyncStatus = instance.autoSync !== false ? chalk.green("✓ Enabled") : chalk.yellow("✗ Disabled");
      console.log(`${chalk.gray("Auto-sync:")} ${autoSyncStatus}`);
    } catch (error) {
      console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Version command
program
  .command("version")
  .description("Check Claude Code version and updates")
  .action(async () => {
    try {
      console.log(chalk.gray("Checking for updates...\n"));

      const versionInfo = await checkForUpdates();

      if (versionInfo.current) {
        console.log(
          `${chalk.gray("Installed:")} ${chalk.cyan(versionInfo.current)}`,
        );
      } else {
        console.log(chalk.yellow("Claude Code is not installed globally"));
      }

      console.log(
        `${chalk.gray("Latest:")}    ${chalk.cyan(versionInfo.latest)}`,
      );
      console.log();

      if (versionInfo.updateAvailable) {
        console.log(chalk.yellow(`⚠ Update available: ${versionInfo.latest}`));
        console.log(chalk.gray("Run 'claude-multi update' to update"));
      } else if (versionInfo.current) {
        console.log(chalk.green("✓ You're up to date!"));
      }
    } catch (error) {
      console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Update command
program
  .command("update")
  .description("Update @anthropic-ai/claude-code to the latest version")
  .action(async () => {
    try {
      const versionInfo = await checkForUpdates();

      if (!versionInfo.updateAvailable && versionInfo.current) {
        console.log(
          chalk.green(`✓ Already up to date (${versionInfo.current})`),
        );
        return;
      }

      await updateClaudeCode();
    } catch (error) {
      console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Auto-sync command
program
  .command("auto-sync <name> <status>")
  .description("Toggle auto-sync for plugins/skills (on/off)")
  .action(async (name: string, status: string) => {
    try {
      const instance = await getInstance(name);

      if (!instance) {
        console.error(chalk.red(`✗ Instance '${name}' not found`));
        process.exit(1);
      }

      const newStatus = status.toLowerCase() === "on" || status.toLowerCase() === "true" || status === "1";
      const currentStatus = instance.autoSync !== false;

      if (currentStatus === newStatus) {
        console.log(
          chalk.yellow(`Auto-sync is already ${newStatus ? "enabled" : "disabled"} for '${name}'`),
        );
        return;
      }

      // Update the instance setting
      await updateInstanceAutoSync(name, newStatus);

      // Apply the sync/unsync
      console.log(chalk.bold(`\n🔄 ${newStatus ? "Enabling" : "Disabling"} auto-sync for '${name}'...\n`));

      if (newStatus) {
        await syncPluginsAndSkills(instance.configDir);
      } else {
        await unsyncPluginsAndSkills(instance.configDir);
      }

      console.log(chalk.green(`\n✓ Auto-sync ${newStatus ? "enabled" : "disabled"} for '${name}'`));
    } catch (error) {
      console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Fix-symlinks command
program
  .command("fix-symlinks [name...]")
  .description("Fix broken symlinks for instances (auto-detects and repairs)")
  .option("-a, --all", "Fix all instances")
  .action(async (names, options) => {
    await handleFixSymlinks(names, options.all);
  });

// Plugins command
program
  .command("plugins")
  .description("Manage enabled plugins for instances")
  .argument("[action]", "Action to perform (list, enable, disable, copy)", "list")
  .argument("[instance]", "Instance name (for list/enable/disable)", "")
  .argument("[plugins...]", "Plugin IDs to enable/disable", [])
  .action(async (action = "list", instanceName = "", plugins: string[] = []) => {
    try {
      switch (action) {
        case "list":
          await handlePluginsList(instanceName);
          break;
        case "enable":
          await handlePluginsEnable(instanceName, plugins);
          break;
        case "disable":
          await handlePluginsDisable(instanceName, plugins);
          break;
        case "copy":
          await handlePluginsCopy(instanceName);
          break;
        default:
          console.error(chalk.red(`✗ Unknown action: ${action}`));
          console.log(chalk.gray("Available actions: list, enable, disable, copy"));
          process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

async function handlePluginsList(instanceName: string): Promise<void> {
  const instances = await listInstances();

  if (!instanceName) {
    // Show plugins for all instances
    console.log(chalk.bold("\n📋 Enabled Plugins by Instance\n"));

    const defaultPlugins = await listAvailablePlugins();

    if (defaultPlugins) {
      console.log(chalk.gray(`Default Claude (~/.claude):`));
      const enabledCount = Object.values(defaultPlugins).filter((v) => v === true).length;
      console.log(chalk.gray(`  Plugins: ${enabledCount} enabled\n`));
      for (const [pluginId, enabled] of Object.entries(defaultPlugins)) {
        const status = enabled ? chalk.green("✓") : chalk.gray("✗");
        console.log(chalk.gray(`    ${status} ${pluginId}`));
      }
      console.log();
    }

    if (instances.length === 0) {
      console.log(chalk.yellow("No instances found."));
      return;
    }

    for (const instance of instances) {
      const plugins = await getEnabledPlugins(instance.configDir);
      console.log(chalk.cyan(`${instance.name}:`));

      if (plugins) {
        const enabledCount = Object.values(plugins).filter((v) => v === true).length;
        console.log(chalk.gray(`  Plugins: ${enabledCount} enabled\n`));
        for (const [pluginId, enabled] of Object.entries(plugins)) {
          const status = enabled ? chalk.green("✓") : chalk.gray("✗");
          console.log(chalk.gray(`    ${status} ${pluginId}`));
        }
      } else {
        console.log(chalk.yellow("  No plugins configured"));
      }
      console.log();
    }
  } else {
    // Show plugins for specific instance
    const instance = await getInstance(instanceName);
    if (!instance) {
      console.error(chalk.red(`✗ Instance '${instanceName}' not found`));
      process.exit(1);
    }

    const plugins = await getEnabledPlugins(instance.configDir);

    if (!plugins) {
      console.log(chalk.yellow(`No plugins configured for '${instanceName}'`));
      return;
    }

    console.log(chalk.bold(`\n📋 Enabled Plugins for '${instanceName}'\n`));

    for (const [pluginId, enabled] of Object.entries(plugins)) {
      const status = enabled ? chalk.green("✓") : chalk.gray("✗");
      console.log(`${status} ${chalk.cyan(pluginId)}`);
    }
  }
}

async function handlePluginsEnable(instanceName: string, plugins: string[]): Promise<void> {
  const instance = await getInstance(instanceName);
  if (!instance) {
    console.error(chalk.red(`✗ Instance '${instanceName}' not found`));
    process.exit(1);
  }

  if (plugins.length === 0) {
    console.error(chalk.red("✗ No plugins specified"));
    console.log(chalk.gray("Usage: claude-multi plugins enable <instance> <plugin-id>..."));
    process.exit(1);
  }

  const currentPlugins = (await getEnabledPlugins(instance.configDir)) || {};
  let updated = false;

  for (const pluginId of plugins) {
    if (currentPlugins[pluginId] === true) {
      console.log(chalk.yellow(`⚠ Plugin '${pluginId}' is already enabled`));
    } else {
      currentPlugins[pluginId] = true;
      await enablePlugin(instance.configDir, pluginId);
      console.log(chalk.green(`✓ Enabled plugin '${pluginId}'`));
      updated = true;
    }
  }

  if (updated) {
    console.log(chalk.green(`\n✓ Updated plugins for '${instanceName}'`));
  }
}

async function handlePluginsDisable(instanceName: string, plugins: string[]): Promise<void> {
  const instance = await getInstance(instanceName);
  if (!instance) {
    console.error(chalk.red(`✗ Instance '${instanceName}' not found`));
    process.exit(1);
  }

  if (plugins.length === 0) {
    console.error(chalk.red("✗ No plugins specified"));
    console.log(chalk.gray("Usage: claude-multi plugins disable <instance> <plugin-id>..."));
    process.exit(1);
  }

  const currentPlugins = (await getEnabledPlugins(instance.configDir)) || {};
  let updated = false;

  for (const pluginId of plugins) {
    if (currentPlugins[pluginId] === false) {
      console.log(chalk.yellow(`⚠ Plugin '${pluginId}' is already disabled`));
    } else {
      currentPlugins[pluginId] = false;
      await disablePlugin(instance.configDir, pluginId);
      console.log(chalk.green(`✓ Disabled plugin '${pluginId}'`));
      updated = true;
    }
  }

  if (updated) {
    console.log(chalk.green(`\n✓ Updated plugins for '${instanceName}'`));
  }
}

async function handlePluginsCopy(instanceName: string): Promise<void> {
  const instance = await getInstance(instanceName);
  if (!instance) {
    console.error(chalk.red(`✗ Instance '${instanceName}' not found`));
    process.exit(1);
  }

  const defaultPlugins = await listAvailablePlugins();
  if (!defaultPlugins) {
    console.log(chalk.yellow("No plugins found in default Claude settings"));
    return;
  }

  console.log(chalk.bold(`\n📋 Copying plugins from default Claude to '${instanceName}'\n`));

  await setEnabledPlugins(instance.configDir, defaultPlugins);

  const enabledCount = Object.values(defaultPlugins).filter((v) => v === true).length;
  console.log(chalk.green(`✓ Copied ${enabledCount} enabled plugins to '${instanceName}'`));
}

async function handleFixSymlinks(names: string[], fixAll: boolean): Promise<void> {
  const instances = await listInstances();

  if (instances.length === 0) {
    console.log(chalk.yellow("No instances found."));
    return;
  }

  let instancesToFix: Instance[];

  if (fixAll) {
    instancesToFix = instances;
  } else if (names.length > 0) {
    instancesToFix = names.map(name => instances.find(i => i.name === name)).filter(Boolean) as Instance[];
  } else {
    // Interactive selection
    const { selected } = await prompts({
      type: "multiselect",
      name: "selected",
      message: "Select instances to fix:",
      choices: instances.map(i => ({
        title: `${i.name} ${i.autoSync ? "(auto-sync)" : "(manual)"}`,
        value: i.name,
      })),
    });
    instancesToFix = selected.map((name: string) => instances.find(i => i.name === name)).filter(Boolean) as Instance[];
  }

  for (const instance of instancesToFix) {
    const diagnosis = detectBrokenSymlinks(instance.configDir);
    const needsFix = diagnosis.broken.length > 0;

    console.log(chalk.bold(`\n🔍 ${instance.name}`));
    console.log(`  Config: ${instance.configDir}`);
    console.log(`  Auto-sync: ${instance.autoSync ? "enabled" : "disabled"}`);

    if (diagnosis.all.length === 0) {
      console.log(chalk.gray("  No symlinks found (manual mode)"));
      continue;
    }

    if (needsFix) {
      console.log(chalk.red(`  ❌ Broken: ${diagnosis.broken.join(", ")}`));

      if (instance.autoSync) {
        // Auto-fix without prompting (user chose auto-fix behavior)
        await syncPluginsAndSkills(instance.configDir);
        console.log(chalk.green(`  ✅ Fixed: ${diagnosis.broken.join(", ")}`));
      } else {
        console.log(chalk.yellow("  ⚠ Auto-sync is disabled. Enable it first."));
      }
    } else {
      console.log(chalk.green(`  ✅ All symlinks OK: ${diagnosis.all.join(", ")}`));
    }
  }

  console.log(chalk.bold("\n✨ Done!"));
}

// Interactive mode command
program
  .command("interactive")
  .alias("i")
  .description("Launch interactive mode for managing Claude Code instances")
  .action(async () => {
    try {
      await runInteractiveMode();
    } catch (error) {
      console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

async function runInteractiveMode(): Promise<void> {
  console.log(chalk.bold.cyan("\n🤖 Claude Multi - Interactive Mode"));
  console.log(chalk.gray("Manage your Claude Code instances with ease\n"));

  while (true) {
    try {
      const instances = await listInstances();

      // Show quick status
      if (instances.length > 0) {
        console.log(
          chalk.gray(
            `You have ${instances.length} instance(s): ${instances.map((i) => chalk.cyan(i.name)).join(", ")}\n`,
          ),
        );
      }

      const { action } = await prompts({
        type: "select",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { title: "➕ Add new instance", value: "add" },
          { title: "📋 List all instances", value: "list" },
          ...(instances.length > 0
            ? [
                { title: "ℹ️  Show instance details", value: "info" },
                { title: "🔌 Manage plugins", value: "plugins" },
                { title: "🔄 Toggle auto-sync", value: "autosync" },
                { title: "🔄 Re-sync symlinks", value: "resync" },
                { title: "🗑️  Remove instance", value: "remove" },
              ]
            : []),
          { title: "🚪 Exit", value: "exit" },
        ],
        initial: 0,
      });

      if (!action || action === "exit") {
        console.log(chalk.gray("\n👋 Goodbye!"));
        break;
      }

      switch (action) {
        case "add":
          await handleAddInstance();
          break;
        case "list":
          await handleListInstances(instances);
          break;
        case "info":
          await handleShowInstanceInfo(instances);
          break;
        case "plugins":
          await handleManagePlugins(instances);
          break;
        case "autosync":
          await handleToggleAutoSync(instances);
          break;
        case "resync":
          await handleFixSymlinks([], false);
          break;
        case "remove":
          await handleRemoveInstance(instances);
          break;
      }

      if (action !== "exit") {
        console.log();
        const { continue: shouldContinue } = await prompts({
          type: "confirm",
          name: "continue",
          message: "Continue managing instances?",
          initial: true,
        });

        if (!shouldContinue) {
          console.log(chalk.gray("\n👋 Goodbye!"));
          break;
        }
        console.log();
      }
    } catch (error) {
      // Handle Ctrl+C gracefully
      if (error instanceof Error && error.message === "cancelled") {
        console.log(chalk.gray("\n👋 Goodbye!"));
        break;
      }
      throw error;
    }
  }
}

async function handleAddInstance(): Promise<void> {
  console.log(chalk.bold("\n➕ Add New Instance\n"));

  const { name } = await prompts({
    type: "text",
    name: "name",
    message: "Instance name:",
    validate: (value: string) => {
      if (!value.trim()) return "Name is required";
      if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
        return "Name can only contain letters, numbers, hyphens, and underscores";
      }
      return true;
    },
  });

  if (!name) return;

  // Check if instance already exists
  const existing = await getInstance(name);
  if (existing) {
    console.log(chalk.red(`✗ Instance '${name}' already exists`));
    return;
  }

  // Ask about provider template
  const { useProvider } = await prompts({
    type: "confirm",
    name: "useProvider",
    message: "Would you like to use a provider template (GLM, MiniMax)?",
    initial: false,
  });

  let providerTemplate: any = null;
  let apiKey = "";

  if (useProvider) {
    const providers = getAvailableProviders();
    const providerChoices = [
      ...providers.map((p) => ({
        title: `${p.displayName} - ${p.description}`,
        value: p.name,
      })),
      { title: "None / Custom", value: "none" },
    ];

    const { selectedProvider } = await prompts({
      type: "select",
      name: "selectedProvider",
      message: "Select a provider:",
      choices: providerChoices,
      initial: 0,
    });

    if (!selectedProvider || selectedProvider === "none") {
      // Continue without template
    } else {
      providerTemplate = getProviderTemplate(selectedProvider);

      if (providerTemplate) {
        const { inputApiKey } = await prompts({
          type: "password",
          name: "inputApiKey",
          message: `Enter your ${providerTemplate.displayName} API key:`,
          validate: (value: string) => {
            if (!value.trim()) return "API key is required";
            return true;
          },
        });

        if (!inputApiKey) return;
        apiKey = inputApiKey;
      }
    }
  }

  const { useDefaults } = await prompts({
    type: "confirm",
    name: "useDefaults",
    message: "Use default paths and settings?",
    initial: true,
  });

  let configDir: string;
  let binaryPath: string;

  if (useDefaults) {
    configDir = join(homedir(), `.claude-${name}`);
    binaryPath = getDefaultBinaryPath(name);
  } else {
    const configResponse = await prompts([
      {
        type: "text",
        name: "configDir",
        message: "Config directory path:",
        initial: join(homedir(), `.claude-${name}`),
      },
      {
        type: "text",
        name: "binaryPath",
        message: "Binary path:",
        initial: getDefaultBinaryPath(name),
      },
    ]);

    if (!configResponse.configDir || !configResponse.binaryPath) return;

    configDir = configResponse.configDir;
    binaryPath = configResponse.binaryPath;
  }

  // Handle copying from default Claude
  let copySettings = false;
  let copyAllFiles = false;
  let copyMcpServers = false;

  const hasDefaultConfig = hasDefaultClaudeConfig();
  const hasDefaultMcp = await hasDefaultMcpConfig();

  if (hasDefaultConfig || hasDefaultMcp) {
    const choices = [{ title: "Nothing - start fresh", value: "none" }];

    if (hasDefaultConfig) {
      choices.push({ title: "Only settings.json", value: "settings" });
    }

    if (hasDefaultMcp) {
      choices.push({ title: "Only MCP servers", value: "mcp" });
    }

    if (hasDefaultConfig && hasDefaultMcp) {
      choices.push({ title: "Settings + MCP servers", value: "settings+mcp" });
    }

    if (hasDefaultConfig) {
      choices.push({
        title: "All files (settings, CLAUDE.md, plugins, etc.)",
        value: "all",
      });
    }

    const { copyOption } = await prompts({
      type: "select",
      name: "copyOption",
      message: "What would you like to copy from default Claude?",
      choices,
      initial: 1,
    });

    if (!copyOption) return;

    copySettings =
      copyOption === "settings" ||
      copyOption === "settings+mcp" ||
      copyOption === "all";
    copyMcpServers =
      copyOption === "mcp" ||
      copyOption === "settings+mcp" ||
      copyOption === "all";
    copyAllFiles = copyOption === "all";
  }

  // Ask about auto-sync for plugins/skills
  let autoSync = true;
  if (copyAllFiles) {
    const { autoSync: autoSyncResponse } = await prompts({
      type: "confirm",
      name: "autoSync",
      message: "Auto-sync plugins and skills via symlinks?",
      initial: true,
      hint: "When enabled, plugins/skills are symlinked from ~/.claude (shared across instances)",
    });

    if (autoSyncResponse === undefined) return;
    autoSync = autoSyncResponse;
  }

  const instance: Instance = {
    name,
    configDir,
    binaryPath,
    createdAt: new Date().toISOString(),
    autoSync,
  };

  await addInstance(instance);
  await createWrapper(instance);

  if (copySettings && !copyAllFiles) {
    await copySettingsFromDefault(configDir);
    console.log(chalk.green("✓ Copied settings.json"));
  }

  if (copyMcpServers && !copyAllFiles) {
    try {
      await copyMcpServersFromDefault(configDir);
      console.log(chalk.green("✓ Copied MCP server configurations"));
    } catch (error) {
      console.log(chalk.yellow(`⚠ Warning: ${(error as Error).message}`));
    }
  }

  if (copyAllFiles) {
    await copyAllFromDefault(configDir, autoSync);
    if (autoSync) {
      console.log(chalk.green("✓ Copied all files with auto-sync (plugins/skills symlinked)"));
    } else {
      console.log(chalk.green("✓ Copied all files from default Claude (manual mode)"));
    }
  }

  // Apply provider template if selected (but not if copying settings)
  if (providerTemplate && !copySettings && !copyAllFiles) {
    await createSettingsFromTemplate(configDir, providerTemplate, apiKey);
    console.log(
      chalk.green(`✓ Applied ${providerTemplate.displayName} template`),
    );
  } else if (providerTemplate && (copySettings || copyAllFiles)) {
    console.log(
      chalk.yellow(
        "⚠ Provider template skipped (copied settings from default Claude)",
      ),
    );
  }

  console.log(chalk.green(`\n✓ Instance '${name}' created successfully!`));
  console.log(chalk.gray(`  Binary: ${binaryPath}`));
  console.log(chalk.gray(`  Config: ${configDir}`));

  // Check PATH
  const binDir = binaryPath.substring(0, binaryPath.lastIndexOf("/"));
  const pathEnv = process.env.PATH || "";
  const isInPath = pathEnv.split(":").some((p) => p === binDir);

  if (!isInPath) {
    console.log(chalk.yellow(`⚠ Warning: ${binDir} is not in your PATH`));
    console.log(chalk.gray(`Add to PATH by running:`));
    console.log(
      chalk.cyan(`  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc`),
    );
    console.log(chalk.cyan(`  source ~/.zshrc`));
  } else {
    console.log(chalk.cyan(`Run: claude-${name} --help`));
  }
}

async function handleListInstances(instances: Instance[]): Promise<void> {
  console.log(chalk.bold("\n📋 All Instances\n"));

  if (instances.length === 0) {
    console.log(chalk.yellow("No instances found."));
    console.log(chalk.gray("Choose 'Add new instance' to create one."));
    return;
  }

  for (const instance of instances) {
    console.log(chalk.cyan(`● ${instance.name}`));
    console.log(chalk.gray(`  Binary:  ${instance.binaryPath}`));
    console.log(chalk.gray(`  Config:  ${instance.configDir}`));
    console.log(
      chalk.gray(`  Created: ${new Date(instance.createdAt).toLocaleString()}`),
    );
    const autoSyncStatus = instance.autoSync !== false ? chalk.green("on") : chalk.yellow("off");
    console.log(chalk.gray(`  Auto-sync: ${autoSyncStatus}`));
    console.log();
  }
}

async function handleShowInstanceInfo(instances: Instance[]): Promise<void> {
  if (instances.length === 0) {
    console.log(chalk.yellow("No instances found."));
    return;
  }

  console.log(chalk.bold("\nℹ️ Instance Details\n"));

  const { instanceName } = await prompts({
    type: "select",
    name: "instanceName",
    message: "Select an instance:",
    choices: instances.map((instance) => ({
      title: instance.name,
      value: instance.name,
    })),
  });

  if (!instanceName) return;

  const instance = instances.find((i) => i.name === instanceName);
  if (!instance) return;

  console.log(chalk.bold(`\nInstance: ${chalk.cyan(instance.name)}`));
  console.log(`${chalk.gray("Binary:")}  ${instance.binaryPath}`);
  console.log(`${chalk.gray("Config:")}  ${instance.configDir}`);
  console.log(
    `${chalk.gray("Created:")} ${new Date(instance.createdAt).toLocaleString()}`,
  );
  const autoSyncStatus = instance.autoSync !== false ? chalk.green("✓ Enabled") : chalk.yellow("✗ Disabled");
  console.log(`${chalk.gray("Auto-sync:")} ${autoSyncStatus}`);
}

async function handleRemoveInstance(instances: Instance[]): Promise<void> {
  if (instances.length === 0) {
    console.log(chalk.yellow("No instances found."));
    return;
  }

  console.log(chalk.bold("\n🗑️ Remove Instance\n"));

  const { instanceName } = await prompts({
    type: "select",
    name: "instanceName",
    message: "Select an instance to remove:",
    choices: instances.map((instance) => ({
      title: `${instance.name} (${instance.configDir})`,
      value: instance.name,
    })),
  });

  if (!instanceName) return;

  const instance = instances.find((i) => i.name === instanceName);
  if (!instance) return;

  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: `Are you sure you want to remove instance '${instanceName}'?`,
    initial: false,
  });

  if (!confirm) {
    console.log(chalk.yellow("✗ Cancelled"));
    return;
  }

  await removeInstance(instanceName);
  removeWrapper(instance.binaryPath);

  console.log(
    chalk.green(`✓ Instance '${instanceName}' removed successfully!`),
  );
  console.log(
    chalk.gray(`To remove config files, run: rm -rf ${instance.configDir}`),
  );
}

async function handleToggleAutoSync(instances: Instance[]): Promise<void> {
  if (instances.length === 0) {
    console.log(chalk.yellow("No instances found."));
    return;
  }

  console.log(chalk.bold("\n🔄 Toggle Auto-Sync\n"));

  const { instanceName } = await prompts({
    type: "select",
    name: "instanceName",
    message: "Select an instance:",
    choices: instances.map((instance) => {
      const currentStatus = instance.autoSync !== false ? "on" : "off";
      return {
        title: `${instance.name} (auto-sync: ${currentStatus})`,
        value: instance.name,
      };
    }),
  });

  if (!instanceName) return;

  const instance = instances.find((i) => i.name === instanceName);
  if (!instance) return;

  const currentStatus = instance.autoSync !== false;

  const { action } = await prompts({
    type: "select",
    name: "action",
    message: `Auto-sync is currently ${chalk.cyan(currentStatus ? "enabled" : "disabled")}. What would you like to do?`,
    choices: [
      { title: currentStatus ? "Turn off (copy files locally)" : "Turn on (use symlinks)", value: "toggle" },
      ...(currentStatus
        ? [{ title: "Force re-sync now (rebuild symlinks)", value: "force-sync" }]
        : []),
      { title: "Cancel", value: "cancel" },
    ],
    initial: 0,
  });

  if (!action || action === "cancel") {
    console.log(chalk.yellow("✗ Cancelled"));
    return;
  }

  try {
    if (action === "force-sync") {
      console.log(chalk.bold(`\n🔄 Re-syncing symlinks for '${instanceName}'...\n`));
      await syncPluginsAndSkills(instance.configDir);
      console.log(chalk.green(`\n✓ Symlinks rebuilt for '${instanceName}'`));
      return;
    }

    const newStatus = !currentStatus;
    console.log(chalk.bold(`\n🔄 ${newStatus ? "Enabling" : "Disabling"} auto-sync for '${instanceName}'...\n`));

    // Update the instance setting
    await updateInstanceAutoSync(instanceName, newStatus);

    // Apply the sync/unsync
    if (newStatus) {
      await syncPluginsAndSkills(instance.configDir);
    } else {
      await unsyncPluginsAndSkills(instance.configDir);
    }

    console.log(chalk.green(`\n✓ Auto-sync ${newStatus ? "enabled" : "disabled"} for '${instanceName}'`));
  } catch (error) {
    console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
  }
}

async function handleManagePlugins(instances: Instance[]): Promise<void> {
  if (instances.length === 0) {
    console.log(chalk.yellow("No instances found."));
    return;
  }

  console.log(chalk.bold("\n🔌 Manage Plugins\n"));

  const { action } = await prompts({
    type: "select",
    name: "action",
    message: "What would you like to do?",
    choices: [
      { title: "📋 List all plugins", value: "list" },
      { title: "📋 Plugins for instance", value: "instance" },
      { title: "✅ Enable plugins", value: "enable" },
      { title: "❌ Disable plugins", value: "disable" },
      { title: "📋 Copy from default", value: "copy" },
      { title: "Cancel", value: "cancel" },
    ],
    initial: 0,
  });

  if (!action || action === "cancel") {
    console.log(chalk.yellow("✗ Cancelled"));
    return;
  }

  switch (action) {
    case "list":
      await handlePluginsList("");
      break;
    case "instance":
      const { listInstance } = await prompts({
        type: "select",
        name: "listInstance",
        message: "Select an instance:",
        choices: instances.map((i) => ({ title: i.name, value: i.name })),
      });
      if (listInstance) {
        await handlePluginsList(listInstance);
      }
      break;
    case "enable": {
      const { enableInstance } = await prompts({
        type: "select",
        name: "enableInstance",
        message: "Select an instance:",
        choices: instances.map((i) => ({ title: i.name, value: i.name })),
      });
      if (!enableInstance) return;

      const plugins = await getEnabledPlugins(
        instances.find((i) => i.name === enableInstance)!.configDir,
      );
      if (!plugins) {
        console.log(chalk.yellow("No plugins configured for this instance"));
        return;
      }

      const { pluginsToEnable } = await prompts({
        type: "multiselect",
        name: "pluginsToEnable",
        message: "Select plugins to enable:",
        choices: Object.entries(plugins)
          .filter(([_, enabled]) => !enabled)
          .map(([pluginId, _]) => ({ title: pluginId, value: pluginId })),
      });

      if (pluginsToEnable && pluginsToEnable.length > 0) {
        await handlePluginsEnable(enableInstance, pluginsToEnable);
      }
      break;
    }
    case "disable": {
      const { disableInstance } = await prompts({
        type: "select",
        name: "disableInstance",
        message: "Select an instance:",
        choices: instances.map((i) => ({ title: i.name, value: i.name })),
      });
      if (!disableInstance) return;

      const plugins = await getEnabledPlugins(
        instances.find((i) => i.name === disableInstance)!.configDir,
      );
      if (!plugins) {
        console.log(chalk.yellow("No plugins configured for this instance"));
        return;
      }

      const { pluginsToDisable } = await prompts({
        type: "multiselect",
        name: "pluginsToDisable",
        message: "Select plugins to disable:",
        choices: Object.entries(plugins)
          .filter(([_, enabled]) => enabled)
          .map(([pluginId, _]) => ({ title: pluginId, value: pluginId })),
      });

      if (pluginsToDisable && pluginsToDisable.length > 0) {
        await handlePluginsDisable(disableInstance, pluginsToDisable);
      }
      break;
    }
    case "copy": {
      const { copyInstance } = await prompts({
        type: "select",
        name: "copyInstance",
        message: "Select an instance:",
        choices: instances.map((i) => ({ title: i.name, value: i.name })),
      });
      if (copyInstance) {
        await handlePluginsCopy(copyInstance);
      }
      break;
    }
  }
}

// MCP command
program
  .command("mcp")
  .description("Manage MCP server configurations")
  .argument("[action]", "Action to perform (list, copy, verify)", "list")
  .argument("[instance]", "Instance name (for list/verify)", "")
  .argument("[source]", "Source instance name (for copy)", "")
  .argument("[target]", "Target instance name (for copy)", "")
  .action(async (action = "list", instance = "", source = "", target = "") => {
    try {
      switch (action) {
        case "list":
          await handleMcpList(instance);
          break;
        case "copy":
          await handleMcpCopy(source, target);
          break;
        case "verify":
          await handleMcpVerify(instance);
          break;
        default:
          console.error(chalk.red(`✗ Unknown action: ${action}`));
          console.log(chalk.gray("Available actions: list, copy, verify"));
          process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

async function handleMcpList(instanceName: string): Promise<void> {
  const instances = await listInstances();

  if (instances.length === 0) {
    console.log(chalk.yellow("No instances found."));
    console.log(chalk.gray("Create an instance with: claude-multi add <name>"));
    return;
  }

  if (!instanceName) {
    // Show all instances with MCP status
    console.log(chalk.bold("\n📋 MCP Servers by Instance\n"));

    for (const instance of instances) {
      const mcpServers = await listMcpServers(instance.name);
      const hasMcp = mcpServers && Object.keys(mcpServers).length > 0;

      console.log(chalk.cyan(`● ${instance.name}`));
      console.log(
        chalk.gray(
          `  MCP Servers: ${hasMcp ? Object.keys(mcpServers!).length : "None"}`,
        ),
      );

      if (hasMcp) {
        for (const [serverName, serverConfig] of Object.entries(mcpServers!)) {
          console.log(chalk.gray(`    • ${serverName} (${serverConfig.type})`));
        }
      }
      console.log();
    }
  } else {
    // Show MCP servers for specific instance
    const mcpServers = await listMcpServers(instanceName);

    if (!mcpServers) {
      console.log(
        chalk.yellow(`No MCP servers found in instance '${instanceName}'`),
      );
      return;
    }

    console.log(chalk.bold(`\n📋 MCP Servers in '${instanceName}'\n`));

    for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
      console.log(chalk.cyan(`● ${serverName}`));
      console.log(chalk.gray(`  Type: ${serverConfig.type}`));

      if (serverConfig.command) {
        console.log(chalk.gray(`  Command: ${serverConfig.command}`));
        if (serverConfig.args && serverConfig.args.length > 0) {
          console.log(chalk.gray(`  Args: ${serverConfig.args.join(" ")}`));
        }
      }

      if (serverConfig.url) {
        console.log(chalk.gray(`  URL: ${serverConfig.url}`));
      }

      if (serverConfig.env && Object.keys(serverConfig.env).length > 0) {
        console.log(
          chalk.gray(
            `  Environment variables: ${Object.keys(serverConfig.env).length}`,
          ),
        );
      }

      console.log();
    }
  }
}

async function handleMcpCopy(
  sourceInstanceName: string,
  targetInstanceName: string,
): Promise<void> {
  const instances = await listInstances();

  if (instances.length < 2) {
    console.log(
      chalk.yellow(
        "Need at least 2 instances to copy MCP servers between them.",
      ),
    );
    return;
  }

  let source = sourceInstanceName;
  let target = targetInstanceName;

  if (!source) {
    const { selectedSource } = await prompts({
      type: "select",
      name: "selectedSource",
      message: "Select source instance:",
      choices: instances.map((instance) => ({
        title: instance.name,
        value: instance.name,
      })),
    });

    if (!selectedSource) return;
    source = selectedSource;
  }

  if (!target) {
    const availableTargets = instances.filter((i) => i.name !== source);
    const { selectedTarget } = await prompts({
      type: "select",
      name: "selectedTarget",
      message: "Select target instance:",
      choices: availableTargets.map((instance) => ({
        title: instance.name,
        value: instance.name,
      })),
    });

    if (!selectedTarget) return;
    target = selectedTarget;
  }

  if (source === target) {
    console.log(chalk.yellow("Source and target instances must be different."));
    return;
  }

  console.log(
    chalk.bold(`\n🔄 Copying MCP servers from '${source}' to '${target}'\n`),
  );

  await copyMcpServersBetweenInstances(source, target);

  console.log(chalk.green(`✓ MCP servers copied successfully!`));
}

async function handleMcpVerify(instanceName: string): Promise<void> {
  const instances = await listInstances();

  if (instances.length === 0) {
    console.log(chalk.yellow("No instances found."));
    return;
  }

  let instance = instanceName;

  if (!instance) {
    const { selectedInstance } = await prompts({
      type: "select",
      name: "selectedInstance",
      message: "Select instance to verify:",
      choices: instances.map((i) => ({
        title: i.name,
        value: i.name,
      })),
    });

    if (!selectedInstance) return;
    instance = selectedInstance;
  }

  console.log(
    chalk.bold(`\n🔍 Verifying MCP configuration in '${instance}'\n`),
  );

  const mcpServers = await listMcpServers(instance);

  if (!mcpServers) {
    console.log(chalk.yellow("⚠ No MCP configuration found"));
    return;
  }

  const serverCount = Object.keys(mcpServers).length;
  console.log(chalk.green(`✓ Found ${serverCount} MCP server(s)`));

  for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
    console.log(chalk.gray(`  • ${serverName}: ${serverConfig.type}`));

    // Basic validation
    if (serverConfig.type === "stdio" && !serverConfig.command) {
      console.log(chalk.yellow(`    ⚠ Missing command for stdio server`));
    } else if (
      (serverConfig.type === "http" || serverConfig.type === "sse") &&
      !serverConfig.url
    ) {
      console.log(
        chalk.yellow(`    ⚠ Missing URL for ${serverConfig.type} server`),
      );
    } else {
      console.log(chalk.green(`    ✓ Configuration looks valid`));
    }
  }
}

// Parse arguments
program.parse();

// Update check for claude-multi
async function runUpdateCheck() {
  try {
    const updateInfo = await checkForClaudeMultiUpdates();

    if (updateInfo.updateAvailable) {
      console.log();
      console.log(chalk.yellow(`New version available: claude-multi ${updateInfo.latest}`));
      console.log(chalk.gray(`Current version: ${updateInfo.current}`));
      console.log();

      const { shouldUpdate } = await prompts({
        type: "confirm",
        name: "shouldUpdate",
        message: "Would you like to update now?",
        initial: true,
      });

      if (shouldUpdate) {
        console.log(chalk.cyan("\nUpdating claude-multi...\n"));
        upgradeClaudeMulti();
        console.log(chalk.green("\nUpdate complete! Please run your command again.\n"));
        process.exit(0);
      }
    }
  } catch {
    // Silent fail - don't interrupt CLI usage
  }
}

// Start update check (non-blocking)
runUpdateCheck().catch(() => {});
