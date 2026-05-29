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
  initializeInstanceState,
  mergeProviderEnv,
  listDefaultPlugins,
  listInstancePlugins,
  copySelectedPlugins,
  removeSinglePlugin,
  isPluginsSymlinked,
  detectMcpCollisions,
  type Instance,
} from "@/config";
import {
  createWrapper,
  removeWrapper,
  getDefaultBinaryPath,
} from "@/wrapper";
import {
  checkForUpdates,
  updateClaudeCode,
  checkForClaudeMultiUpdates,
  upgradeClaudeMulti,
  getClaudeMultiVersion,
} from "@/version";
import { getAvailableProviders, getProviderTemplate, providerHasRegions, resolveRegionTemplate, MIMO_TOKEN_REGIONS } from "@/templates";
import { toMessage } from "@/errors";
import { CopyOption, PluginAction, McpAction, PluginCategory, McpServerType } from "@/constants";
import type { ProviderTemplate } from "@/templates";

function exitWithCode(code: 0 | 1): never {
  process.exit(code);
}

async function requireInstance(name: string): Promise<Instance> {
  const instance = await getInstance(name);
  if (!instance) {
    console.error(chalk.red(`✗ Instance '${name}' not found`));
    exitWithCode(1);
  }
  return instance;
}

function requireNonEmptyArgs(items: string[], errorMsg: string, usage: string): void {
  if (items.length === 0) {
    console.error(chalk.red(errorMsg));
    console.log(chalk.gray(usage));
    exitWithCode(1);
  }
}

const program = new Command();

program
  .name("claude-multi")
  .description("Manage multiple Claude Code instances with different aliases")
  .version(getClaudeMultiVersion());

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
  .option("--provider <name>", "Use a provider template (glm, minimax, deepseek, mimo, mimo-token, kimi, qwen, qwen-coding)")
  .option("--api-key <key>", "API key for the provider")
  .option("--region <region>", "Region for regional providers (e.g., cn, sgp, ams for mimo-token)")
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
        region?: string;
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
        let providerTemplate: ProviderTemplate | null | undefined = null;
        let apiKey = "";
        let autoSync = !options.manual;

        // Handle provider template in CLI mode
        if (options.provider) {
          providerTemplate = getProviderTemplate(options.provider);
          if (!providerTemplate) {
            console.error(
              chalk.red(
                `✗ Unknown provider '${options.provider}'. Available: ${getAvailableProviders().map((p) => p.name).join(", ")}`,
              ),
            );
            exitWithCode(1);
          }

          if (!options.apiKey) {
            console.error(
              chalk.red("✗ --api-key is required when using --provider"),
            );
            exitWithCode(1);
          }

          apiKey = options.apiKey;
          useProviderTemplate = true;

          if (providerHasRegions(providerTemplate.name)) {
            const region = options.region || "cn";
            try {
              providerTemplate = resolveRegionTemplate(providerTemplate, region);
            } catch (err: unknown) {
              console.error(chalk.red(`✗ ${toMessage(err)}`));
              exitWithCode(1);
            }
          }
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
          }
          if (options.copySettings && !options.copyAll) {
            copySettings = true;
          }
          if (options.copyMcp) {
            copyMcpServers = true;
          }
          // skipPrompts means start fresh (both false)
        } else {
          // No flags — launch the Ink interactive wizard
          const useInk = process.env.CLAUDE_MULTI_INK !== "false";
          if (useInk) {
            try {
              const { render } = await import("ink");
              const React = await import("react");
              const { AddInstance } = await import("./ink/screens/AddInstance.js");
              const { waitUntilExit } = render(
                React.createElement(AddInstance, { onBack: () => process.exit(0), initialName: name }),
              );
              await waitUntilExit();
              return;
            } catch (inkError: unknown) {
              console.error(chalk.yellow(`Ink UI unavailable, falling back to prompts: ${toMessage(inkError)}`));
            }
          }

          // Prompts fallback
          if (hasDefaultConfig || hasDefaultMcp) {
            console.log(chalk.gray("\nFound existing Claude Code configuration at ~/.claude"));

            const choices = [{ title: "Nothing - start fresh", value: CopyOption.None }];
            if (hasDefaultConfig) choices.push({ title: "Only settings.json", value: CopyOption.Settings });
            if (hasDefaultMcp) choices.push({ title: "Only MCP servers", value: CopyOption.Mcp });
            if (hasDefaultConfig && hasDefaultMcp) choices.push({ title: "Settings + MCP servers", value: CopyOption.SettingsAndMcp });
            if (hasDefaultConfig) choices.push({ title: "All files (settings, CLAUDE.md, plugins, etc.)", value: CopyOption.All });

            const response = await prompts([{
              type: "select",
              name: "copyOption",
              message: "What would you like to copy from default Claude?",
              choices,
              initial: 1,
            }]);

            if (response.copyOption === undefined) {
              console.log(chalk.yellow("\n✗ Cancelled"));
              exitWithCode(0);
            }

            copySettings = response.copyOption === CopyOption.Settings || response.copyOption === CopyOption.SettingsAndMcp || response.copyOption === CopyOption.All;
            copyMcpServers = response.copyOption === CopyOption.Mcp || response.copyOption === CopyOption.SettingsAndMcp || response.copyOption === CopyOption.All;
            copyAllFiles = response.copyOption === CopyOption.All;
          }
        }

        const instance: Instance = {
          name,
          configDir,
          binaryPath,
          createdAt: new Date().toISOString(),
          autoSync,
        };

        await addInstance(instance);
        try {
          await createWrapper(instance);
          await initializeInstanceState(configDir);

          // Copy files if requested
          if (copySettings && !copyAllFiles) {
            await copySettingsFromDefault(configDir);
            console.log(chalk.green("✓ Copied settings.json"));
          }

          if (copyMcpServers && !copyAllFiles) {
            try {
              await copyMcpServersFromDefault(configDir);
              console.log(chalk.green("✓ Copied MCP server configurations"));
            } catch (error: unknown) {
              console.log(
                chalk.yellow(`⚠ Warning: ${toMessage(error)}`),
              );
            }
          }

          if (copyAllFiles) {
            await copyAllFromDefault(configDir);
            if (autoSync) {
              console.log(chalk.green("✓ Copied all files with auto-sync (plugins/skills symlinked)"));
            } else {
              console.log(chalk.green("✓ Copied all files from default Claude (manual mode)"));
            }
          }

          // Apply provider template if selected
          if (useProviderTemplate && providerTemplate) {
            await mergeProviderEnv(configDir, providerTemplate, apiKey);
            console.log(
              chalk.green(`✓ Applied ${providerTemplate.displayName} template`),
            );
          }
        } catch (err: unknown) {
          await removeInstance(name).catch(() => {});
          removeWrapper(binaryPath);
          throw err;
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
      } catch (error: unknown) {
        console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
        exitWithCode(1);
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
      const instance = await requireInstance(name);

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
    } catch (error: unknown) {
      console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
      exitWithCode(1);
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
    } catch (error: unknown) {
      console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
      exitWithCode(1);
    }
  });

// Info command
program
  .command("info <name>")
  .description("Show details about a specific instance")
  .action(async (name: string) => {
    try {
      const instance = await requireInstance(name);

      console.log(chalk.bold(`Instance: ${chalk.cyan(instance.name)}\n`));
      console.log(`${chalk.gray("Binary:")}  ${instance.binaryPath}`);
      console.log(`${chalk.gray("Config:")}  ${instance.configDir}`);
      console.log(
        `${chalk.gray("Created:")} ${new Date(instance.createdAt).toLocaleString()}`,
      );
      const autoSyncStatus = instance.autoSync !== false ? chalk.green("✓ Enabled") : chalk.yellow("✗ Disabled");
      console.log(`${chalk.gray("Auto-sync:")} ${autoSyncStatus}`);
    } catch (error: unknown) {
      console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
      exitWithCode(1);
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
    } catch (error: unknown) {
      console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
      exitWithCode(1);
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
    } catch (error: unknown) {
      console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
      exitWithCode(1);
    }
  });

// Auto-sync command
program
  .command("auto-sync <name> <status>")
  .description("Toggle auto-sync for plugins/skills (on/off)")
  .action(async (name: string, status: string) => {
    try {
      const instance = await requireInstance(name);

      const normalized = status.toLowerCase();
      const newStatus = normalized === "on" || normalized === "true" || status === "1";
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
    } catch (error: unknown) {
      console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
      exitWithCode(1);
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

// Doctor command — diagnose and fix common issues
program
  .command("doctor")
  .description("Diagnose and fix common issues")
  .argument("[action]", "Action to perform (fix, check)", "check")
  .action(async (action = "check") => {
    try {
      const instances = await listInstances();
      const { runHealthChecks, fixWrapperVersions } = await import("@/health");
      const { existsSync } = await import("node:fs");
      const { PINNED_CLAUDE_BIN } = await import("@/paths");
      const { installPinnedClaude, getPinnedBinaryVersion, isThirdPartyApiBroken, COMPATIBLE_CLAUDE_VERSION } = await import("@/version");

      if (action === "fix") {
        console.log(chalk.bold("\n🔧 Doctor Fix\n"));

        // [SAFE PARK] Ensure pinned binary is installed and up-to-date
        if (!existsSync(PINNED_CLAUDE_BIN)) {
          console.log(chalk.cyan(`Installing compatible Claude v${COMPATIBLE_CLAUDE_VERSION}...`));
          installPinnedClaude();
          console.log(chalk.green(`✓ Installed pinned Claude v${COMPATIBLE_CLAUDE_VERSION}`));
        } else {
          const pinnedVer = getPinnedBinaryVersion();
          const needsReinstall = !pinnedVer || isThirdPartyApiBroken(pinnedVer) || pinnedVer !== COMPATIBLE_CLAUDE_VERSION;
          if (needsReinstall) {
            const reason = !pinnedVer ? "version unknown" : isThirdPartyApiBroken(pinnedVer) ? "incompatible" : "outdated";
            console.log(chalk.yellow(`Pinned binary is ${pinnedVer ? `v${pinnedVer}` : reason}. Reinstalling v${COMPATIBLE_CLAUDE_VERSION}...`));
            installPinnedClaude();
            console.log(chalk.green(`✓ Reinstalled pinned Claude v${COMPATIBLE_CLAUDE_VERSION}`));
          }
        }

        // [SAFE PARK] Fix wrapper versions
        const fixed = fixWrapperVersions(instances);
        if (fixed.length > 0) {
          console.log(chalk.green(`✓ Fixed ${fixed.length} wrapper(s) to use pinned Claude version:`));
          for (const name of fixed) {
            console.log(chalk.gray(`  • ${name}`));
          }
        } else {
          console.log(chalk.gray("  All wrappers already use the correct Claude version"));
        }

        console.log(chalk.green("\n✓ Doctor fix complete!"));
      } else {
        // Check mode
        console.log(chalk.bold("\n🔍 Doctor Check\n"));
        const issues = runHealthChecks(instances);

        if (issues.length === 0) {
          console.log(chalk.green("✓ No issues found!"));
        } else {
          console.log(chalk.yellow(`Found ${issues.length} issue(s):\n`));
          for (const issue of issues) {
            const icon = issue.severity === "error" ? "✗" : "⚠";
            const color = issue.severity === "error" ? chalk.red : chalk.yellow;
            console.log(color(`  ${icon} ${issue.title}`));
            console.log(chalk.gray(`    ${issue.message}`));
            if (issue.resolutionHint) {
              console.log(chalk.gray(`    Fix: ${issue.resolutionHint}`));
            }
            console.log();
          }
          console.log(chalk.gray("Run 'claude-multi doctor fix' to auto-fix"));
        }
      }
    } catch (error: unknown) {
      console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
      exitWithCode(1);
    }
  });

// Plugins command
program
  .command("plugins")
  .description("Manage plugins for instances")
  .argument("[action]", "Action to perform (list, enable, disable, copy, install, remove, list-defaults, list-installed, check-collisions)", "list")
  .argument("[instance]", "Instance name (for list/enable/disable/install/remove)", "")
  .argument("[plugins...]", "Plugin IDs", [])
  .action(async (action = "list", instanceName = "", plugins: string[] = []) => {
    try {
      switch (action) {
        case PluginAction.List:
          await handlePluginsList(instanceName);
          break;
        case PluginAction.Enable:
          await handlePluginsEnable(instanceName, plugins);
          break;
        case PluginAction.Disable:
          await handlePluginsDisable(instanceName, plugins);
          break;
        case PluginAction.Copy:
          await handlePluginsCopy(instanceName);
          break;
        case PluginAction.Install:
          await handlePluginsInstall(instanceName, plugins);
          break;
        case PluginAction.Remove:
          await handlePluginsRemove(instanceName, plugins);
          break;
        case PluginAction.ListDefaults:
          handlePluginsListDefaults();
          break;
        case PluginAction.ListInstalled:
          await handlePluginsListInstalled(instanceName);
          break;
        case PluginAction.CheckCollisions:
          await handlePluginsCheckCollisions(instanceName, plugins);
          break;
        default:
          console.error(chalk.red(`✗ Unknown action: ${action}`));
          console.log(chalk.gray("Available actions: list, enable, disable, copy, install, remove, list-defaults, list-installed, check-collisions"));
          exitWithCode(1);
      }
    } catch (error: unknown) {
      console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
      exitWithCode(1);
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
    const instance = await requireInstance(instanceName);

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

async function handlePluginsSetEnabled(instanceName: string, plugins: string[], enable: boolean): Promise<void> {
  const instance = await requireInstance(instanceName);
  const verb = enable ? "enable" : "disable";
  requireNonEmptyArgs(plugins, "✗ No plugins specified", `Usage: claude-multi plugins ${verb} <instance> <plugin-id>...`);

  const currentPlugins = (await getEnabledPlugins(instance.configDir)) || {};
  let updated = false;

  for (const pluginId of plugins) {
    if (currentPlugins[pluginId] === enable) {
      console.log(chalk.yellow(`⚠ Plugin '${pluginId}' is already ${enable ? "enabled" : "disabled"}`));
    } else {
      currentPlugins[pluginId] = enable;
      if (enable) {
        await enablePlugin(instance.configDir, pluginId);
      } else {
        await disablePlugin(instance.configDir, pluginId);
      }
      console.log(chalk.green(`✓ ${enable ? "Enabled" : "Disabled"} plugin '${pluginId}'`));
      updated = true;
    }
  }

  if (updated) {
    console.log(chalk.green(`\n✓ Updated plugins for '${instanceName}'`));
  }
}

function handlePluginsEnable(instanceName: string, plugins: string[]): Promise<void> {
  return handlePluginsSetEnabled(instanceName, plugins, true);
}

function handlePluginsDisable(instanceName: string, plugins: string[]): Promise<void> {
  return handlePluginsSetEnabled(instanceName, plugins, false);
}

async function handlePluginsCopy(instanceName: string): Promise<void> {
  const instance = await requireInstance(instanceName);

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

async function handlePluginsInstall(instanceName: string, pluginIds: string[]): Promise<void> {
  if (!instanceName) {
    console.error(chalk.red("✗ Instance name required"));
    console.log(chalk.gray("Usage: claude-multi plugins install <instance> <plugin-id>..."));
    exitWithCode(1);
  }

  const instance = await requireInstance(instanceName);

  if (isPluginsSymlinked(instance.configDir)) {
    console.error(chalk.red("✗ Instance has auto-sync enabled (symlinked plugins). Disable auto-sync first."));
    exitWithCode(1);
  }

  if (pluginIds.length === 0) {
    console.error(chalk.red("✗ No plugins specified"));
    console.log(chalk.gray("Usage: claude-multi plugins install <instance> <plugin-id>..."));
    exitWithCode(1);
  }

  const defaults = listDefaultPlugins();
  const selections = pluginIds.map(id => {
    const p = defaults.find(dp => dp.id === id);
    if (!p) {
      console.error(chalk.red(`✗ Plugin '${id}' not found in default installation`));
      exitWithCode(1);
    }
    return { id, category: p.category === PluginCategory.Internal ? PluginCategory.Internal : PluginCategory.External };
  });

  const collisions = detectMcpCollisions(instance.configDir, pluginIds);
  if (collisions.length > 0) {
    console.log(chalk.yellow("\n⚠ MCP server name collisions detected:\n"));
    for (const c of collisions) {
      console.log(chalk.yellow(`  • ${c.serverName}: conflicts with existing server`));
    }
    console.log();
  }

  await copySelectedPlugins(instance.configDir, selections);
  console.log(chalk.green(`✓ Installed ${selections.length} plugin(s) to '${instanceName}'`));
}

async function handlePluginsRemove(instanceName: string, pluginIds: string[]): Promise<void> {
  requireNonEmptyArgs([instanceName], "✗ Instance name required", "Usage: claude-multi plugins remove <instance> <plugin-id>...");
  const instance = await requireInstance(instanceName);

  if (isPluginsSymlinked(instance.configDir)) {
    console.error(chalk.red("✗ Instance has auto-sync enabled (symlinked plugins). Disable auto-sync first."));
    exitWithCode(1);
  }

  requireNonEmptyArgs(pluginIds, "✗ No plugins specified", "Usage: claude-multi plugins remove <instance> <plugin-id>...");

  const installed = listInstancePlugins(instance.configDir);
  for (const id of pluginIds) {
    const p = installed.find(ip => ip.id === id);
    if (!p) {
      console.error(chalk.red(`✗ Plugin '${id}' not installed in '${instanceName}'`));
      continue;
    }
    await removeSinglePlugin(instance.configDir, id, p.category === PluginCategory.Internal ? PluginCategory.Internal : PluginCategory.External);
    console.log(chalk.green(`✓ Removed plugin '${id}' from '${instanceName}'`));
  }
}

function handlePluginsListDefaults(): void {
  const plugins = listDefaultPlugins();

  if (plugins.length === 0) {
    console.log(chalk.yellow("No plugins found in default Claude installation."));
    return;
  }

  console.log(chalk.bold(`\n📋 Default Plugins (${plugins.length})\n`));

  const internals = plugins.filter(p => p.category === PluginCategory.Internal);
  const externals = plugins.filter(p => p.category === PluginCategory.External);

  if (internals.length > 0) {
    console.log(chalk.cyan("Internal:"));
    for (const p of internals) {
      const badge = p.hasMcp ? chalk.cyan(" (MCP)") : "";
      const status = p.enabled ? chalk.green("✓") : chalk.gray("✗");
      console.log(`  ${status} ${p.name}${badge}`);
    }
    console.log();
  }

  if (externals.length > 0) {
    console.log(chalk.cyan("External:"));
    for (const p of externals) {
      const badge = p.hasMcp ? chalk.cyan(" (MCP)") : "";
      const status = p.enabled ? chalk.green("✓") : chalk.gray("✗");
      console.log(`  ${status} ${p.name}${badge}`);
    }
  }
}

async function handlePluginsListInstalled(instanceName: string): Promise<void> {
  if (!instanceName) {
    const instances = await listInstances();
    for (const inst of instances) {
      const plugins = listInstancePlugins(inst.configDir);
      console.log(chalk.cyan(`${inst.name}:`) + chalk.gray(` ${plugins.length} plugin(s)`));
      for (const p of plugins) {
        const status = p.enabled ? chalk.green("✓") : chalk.gray("✗");
        const badge = p.hasMcp ? chalk.cyan(" (MCP)") : "";
        const cat = p.category === PluginCategory.External ? chalk.gray(" [ext]") : "";
        console.log(`  ${status} ${p.name}${badge}${cat}`);
      }
      console.log();
    }
    return;
  }

  const instance = await requireInstance(instanceName);

  const plugins = listInstancePlugins(instance.configDir);
  if (plugins.length === 0) {
    console.log(chalk.yellow(`No plugins installed in '${instanceName}'`));
    return;
  }

  console.log(chalk.bold(`\n📋 Installed Plugins for '${instanceName}' (${plugins.length})\n`));
  for (const p of plugins) {
    const status = p.enabled ? chalk.green("✓") : chalk.gray("✗");
    const badge = p.hasMcp ? chalk.cyan(" (MCP)") : "";
    const cat = p.category === PluginCategory.External ? chalk.gray(" [ext]") : "";
    console.log(`  ${status} ${p.name}${badge}${cat}`);
  }
}

async function handlePluginsCheckCollisions(instanceName: string, pluginIds: string[]): Promise<void> {
  if (!instanceName) {
    console.error(chalk.red("✗ Instance name required"));
    console.log(chalk.gray("Usage: claude-multi plugins check-collisions <instance> <plugin-id>..."));
    exitWithCode(1);
  }

  const instance = await requireInstance(instanceName);

  if (pluginIds.length === 0) {
    console.error(chalk.red("✗ No plugins specified"));
    exitWithCode(1);
  }

  const collisions = detectMcpCollisions(instance.configDir, pluginIds);
  if (collisions.length === 0) {
    console.log(chalk.green("✓ No MCP server name collisions detected"));
  } else {
    console.log(chalk.yellow(`\n⚠ ${collisions.length} collision(s) detected:\n`));
    for (const c of collisions) {
      console.log(chalk.yellow(`  • ${c.serverName}`));
    }
    exitWithCode(1);
  }
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
    } catch (error: unknown) {
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
    message: "Would you like to use a provider template (GLM, MiniMax, DeepSeek)?",
    initial: false,
  });

  let providerTemplate: ProviderTemplate | null = null;
  let apiKey = "";

  if (useProvider) {
    const providers = getAvailableProviders();
    const providerChoices = [
      ...providers.map((p) => ({
        title: `${p.displayName} - ${p.description}`,
        value: p.name,
      })),
      { title: "None / Custom", value: CopyOption.None },
    ];

    const { selectedProvider } = await prompts({
      type: "select",
      name: "selectedProvider",
      message: "Select a provider:",
      choices: providerChoices,
      initial: 0,
    });

    if (!selectedProvider || selectedProvider === CopyOption.None) {
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

      if (providerTemplate && providerHasRegions(providerTemplate.name)) {
        console.log(
          chalk.yellow.bold("⚠ Check your Xiaomi account console to confirm the correct region for your subscription."),
        );

        const regionChoices = Object.entries(MIMO_TOKEN_REGIONS).map(([key, val]) => ({
          title: `${val.label} — ${val.baseUrl}`,
          value: key,
        }));

        const { selectedRegion } = await prompts({
          type: "select",
          name: "selectedRegion",
          message: "Select your subscription region:",
          choices: regionChoices,
          initial: 0,
        });

        if (selectedRegion) {
          providerTemplate = resolveRegionTemplate(providerTemplate, selectedRegion);
        }
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
    const choices = [{ title: "Nothing - start fresh", value: CopyOption.None }];

    if (hasDefaultConfig) {
      choices.push({ title: "Only settings.json", value: CopyOption.Settings });
    }

    if (hasDefaultMcp) {
      choices.push({ title: "Only MCP servers", value: CopyOption.Mcp });
    }

    if (hasDefaultConfig && hasDefaultMcp) {
      choices.push({ title: "Settings + MCP servers", value: CopyOption.SettingsAndMcp });
    }

    if (hasDefaultConfig) {
      choices.push({
        title: "All files (settings, CLAUDE.md, plugins, etc.)",
        value: CopyOption.All,
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
      copyOption === CopyOption.Settings ||
      copyOption === CopyOption.SettingsAndMcp ||
      copyOption === CopyOption.All;
    copyMcpServers =
      copyOption === CopyOption.Mcp ||
      copyOption === CopyOption.SettingsAndMcp ||
      copyOption === CopyOption.All;
    copyAllFiles = copyOption === CopyOption.All;
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
  try {
    await createWrapper(instance);

    if (copySettings && !copyAllFiles) {
      await copySettingsFromDefault(configDir);
      console.log(chalk.green("✓ Copied settings.json"));
    }

    if (copyMcpServers && !copyAllFiles) {
      try {
        await copyMcpServersFromDefault(configDir);
        console.log(chalk.green("✓ Copied MCP server configurations"));
      } catch (error: unknown) {
        console.log(chalk.yellow(`⚠ Warning: ${toMessage(error)}`));
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
  } catch (err: unknown) {
    await removeInstance(name).catch(() => {});
    removeWrapper(binaryPath);
    throw err;
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
  } catch (error: unknown) {
    console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
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
      { title: "📋 List all plugins", value: PluginAction.List },
      { title: "📋 Plugins for instance", value: "instance" },
      { title: "✅ Enable plugins", value: PluginAction.Enable },
      { title: "❌ Disable plugins", value: PluginAction.Disable },
      { title: "📋 Copy from default", value: PluginAction.Copy },
      { title: "Cancel", value: "cancel" },
    ],
    initial: 0,
  });

  if (!action || action === "cancel") {
    console.log(chalk.yellow("✗ Cancelled"));
    return;
  }

  switch (action) {
    case PluginAction.List:
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
    case PluginAction.Enable: {
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
    case PluginAction.Disable: {
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
    case PluginAction.Copy: {
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
        case McpAction.List:
          await handleMcpList(instance);
          break;
        case McpAction.Copy:
          await handleMcpCopy(source, target);
          break;
        case McpAction.Verify:
          await handleMcpVerify(instance);
          break;
        default:
          console.error(chalk.red(`✗ Unknown action: ${action}`));
          console.log(chalk.gray("Available actions: list, copy, verify"));
          exitWithCode(1);
      }
    } catch (error: unknown) {
      console.error(chalk.red(`✗ Error: ${toMessage(error)}`));
      exitWithCode(1);
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
    if (serverConfig.type === McpServerType.Stdio && !serverConfig.command) {
      console.log(chalk.yellow(`    ⚠ Missing command for stdio server`));
    } else if (
      (serverConfig.type === McpServerType.Http || serverConfig.type === McpServerType.Sse) &&
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

// Default action: launch interactive mode when no subcommand is given
program.action(async () => {
  skipGlobalUpdateCheck = true;

  // Reject unknown subcommands that fell through to the default action
  const unknownArgs = program.args.filter(a => !a.startsWith("-"));
  if (unknownArgs.length > 0) {
    console.error(chalk.red(`✗ Unknown command: ${unknownArgs[0]}`));
    console.log(chalk.gray("Run 'claude-multi --help' for available commands."));
    exitWithCode(1);
  }

  try {
    const { render } = await import("ink");
    const React = await import("react");
    const { App } = await import("./ink/App.js");
    const { waitUntilExit } = render(React.createElement(App));
    await waitUntilExit();
  } catch (error: unknown) {
    console.error(chalk.red(`✗ Error launching interactive mode: ${toMessage(error)}`));
    exitWithCode(1);
  }
  if (process.env.CLAUDE_MULTI_UPDATE_CHECK === "true") {
    await runUpdateCheck().catch(() => {});
  }
});

// Suppressed by interactive commands — they run the check after Ink exits
let skipGlobalUpdateCheck = false;

// Parse arguments
program.parse();

// Update check — disabled by default, set CLAUDE_MULTI_UPDATE_CHECK=true to enable
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
        exitWithCode(0);
      }
    }
  } catch {
    // Silent fail — never interrupt CLI usage
  }
}

if (!skipGlobalUpdateCheck && process.env.CLAUDE_MULTI_UPDATE_CHECK === "true") {
  runUpdateCheck().catch(() => {});
}

