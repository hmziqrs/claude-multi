import { Command } from "commander";
import chalk from "chalk";
import prompts from "prompts";
import { homedir } from "node:os";
import { join, dirname, delimiter, sep } from "node:path";
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
  updateInstanceSyncMode,
  getSyncMode,
  syncModeLabel,
  syncPluginsAndSkills,
  unsyncPluginsAndSkills,
  halfSyncPluginsAndSkills,
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
  isHalfManualSync,
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
import { getAvailableProviders, getProviderTemplate, providerHasRegions, resolveRegionTemplate, getProviderRegions } from "@/templates";
import { LEGACY_INSTANCE_VERSION } from "@/migration";
import { toMessage } from "@/errors";
import { CopyOption, PluginAction, McpAction, PluginCategory, McpServerType, SyncMode, type SyncMode as SyncModeType, canConvertSyncMode } from "@/constants";
import type { ProviderTemplate } from "@/templates";

function exitWithCode(code: 0 | 1): never {
  process.exit(code);
}

function formatVersionLabel(ver: string): string {
  return ver === LEGACY_INSTANCE_VERSION ? `${ver} (before version tracking)` : ver;
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
  .option("--manual", "Manually manage plugins/skills (full copy)")
  .option("--half-manual", "Symlink individual plugins/skills, new installs stay isolated")
  .option("--sync-mode <mode>", "Sync mode: auto, half-manual, full-manual")
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
        halfManual?: boolean;
        syncMode?: string;
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

        // Resolve sync mode from flags (detect conflicting flags)
        let effectiveSyncMode: SyncModeType;
        const flagCount = [options.syncMode, options.autoSync, options.halfManual, options.manual].filter(Boolean).length;
        if (flagCount > 1) {
          console.error(chalk.red("✗ Conflicting sync mode flags. Use only one of: --sync-mode, --auto-sync, --half-manual, --manual"));
          exitWithCode(1);
        }
        if (options.syncMode) {
          const valid = [SyncMode.Auto, SyncMode.HalfManual, SyncMode.FullManual];
          if (!valid.includes(options.syncMode as SyncModeType)) {
            console.error(chalk.red(`✗ Invalid sync mode '${options.syncMode}'. Use: ${valid.join(", ")}`));
            exitWithCode(1);
          }
          effectiveSyncMode = options.syncMode as SyncModeType;
        } else if (options.autoSync) {
          effectiveSyncMode = SyncMode.Auto;
        } else if (options.halfManual) {
          effectiveSyncMode = SyncMode.HalfManual;
        } else if (options.manual) {
          effectiveSyncMode = SyncMode.FullManual;
        } else {
          effectiveSyncMode = SyncMode.Auto;
        }

        // Legacy boolean for Instance field compat
        const autoSync = effectiveSyncMode === SyncMode.Auto;
        let providerRegion: string | undefined;

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
            if (!options.region) {
              const regions = getProviderRegions(providerTemplate.name);
              console.log(chalk.yellow(`⚠ No --region specified, defaulting to cn. Available: ${regions ? Object.keys(regions).join(", ") : "cn"}`));
            }
            providerRegion = region;
            try {
              providerTemplate = resolveRegionTemplate(providerTemplate, region);
            } catch (err: unknown) {
              console.error(chalk.red(`✗ ${toMessage(err)}`));
              exitWithCode(1);
            }
          } else if (options.region) {
            console.log(chalk.yellow(`⚠ --region is ignored for non-regional provider '${providerTemplate.name}'`));
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
              const [{ render }, React, { AddInstance }] = await Promise.all([
                import("ink"),
                import("react"),
                import("./ink/screens/AddInstance.js"),
              ]);
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

            const choices: { title: string; value: CopyOption }[] = [{ title: "Nothing - start fresh", value: CopyOption.None }];
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
          syncMode: effectiveSyncMode,
          createdWithVersion: getClaudeMultiVersion(),
          ...(useProviderTemplate && providerTemplate ? { providerTemplate: providerTemplate.name } : {}),
          ...(providerRegion ? { providerRegion } : {}),
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
            await copyAllFromDefault(configDir, effectiveSyncMode);
            if (effectiveSyncMode === SyncMode.Auto) {
              console.log(chalk.green("✓ Copied all files with auto-sync (plugins/skills symlinked)"));
            } else if (effectiveSyncMode === SyncMode.HalfManual) {
              console.log(chalk.green("✓ Copied all files with half-manual sync (individual plugins/skills symlinked)"));
            } else {
              console.log(chalk.green("✓ Copied all files from default Claude (full-manual mode)"));
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
        const binDir = dirname(binaryPath);
        const pathEnv = process.env.PATH || "";
        const isInPath = pathEnv.split(delimiter).some((p) => p === binDir);

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
        if (instance.providerTemplate) {
          const region = instance.providerRegion ? ` (${instance.providerRegion})` : "";
          console.log(chalk.gray(`  Provider: ${instance.providerTemplate}${region}`));
        }
        const mode = getSyncMode(instance);
        const label = syncModeLabel(mode);
        const modeColor = mode === SyncMode.Auto ? chalk.green : mode === SyncMode.HalfManual ? chalk.cyan : chalk.yellow;
        console.log(chalk.gray(`  Sync mode: ${modeColor(label)}`));
        console.log(chalk.gray(`  Version:  ${formatVersionLabel(instance.createdWithVersion)}`));
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
      const mode = getSyncMode(instance);
      const modeColor = mode === SyncMode.Auto ? chalk.green : mode === SyncMode.HalfManual ? chalk.cyan : chalk.yellow;
      console.log(`${chalk.gray("Sync mode:")} ${modeColor(syncModeLabel(mode))}`);
      console.log(`${chalk.gray("Version:")}  ${formatVersionLabel(instance.createdWithVersion)}`);
      if (instance.providerTemplate) {
        const region = instance.providerRegion ? ` (${instance.providerRegion})` : "";
        console.log(`${chalk.gray("Provider:")} ${instance.providerTemplate}${region}`);
      }
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
  .description("Set sync mode for plugins/skills (auto, half-manual, full-manual, on, off)")
  .action(async (name: string, status: string) => {
    try {
      const instance = await requireInstance(name);
      const currentMode = getSyncMode(instance);

      // Map legacy on/off to modes
      const normalized = status.toLowerCase();
      let newMode: SyncModeType;
      if (normalized === "on" || normalized === "true" || status === "1") {
        newMode = SyncMode.Auto;
      } else if (normalized === "off" || normalized === "false" || status === "0") {
        newMode = SyncMode.FullManual;
      } else if (normalized === SyncMode.Auto || normalized === SyncMode.HalfManual || normalized === SyncMode.FullManual) {
        newMode = normalized as SyncModeType;
      } else {
        console.error(chalk.red(`✗ Unknown sync mode '${status}'. Use: auto, half-manual, full-manual, on, off`));
        exitWithCode(1);
      }

      if (currentMode === newMode) {
        console.log(
          chalk.yellow(`Sync mode is already '${syncModeLabel(newMode)}' for '${name}'`),
        );
        return;
      }

      // Validate downgrade-only rule
      if (!canConvertSyncMode(currentMode, newMode)) {
        console.error(
          chalk.red(`✗ Cannot convert from '${syncModeLabel(currentMode)}' to '${syncModeLabel(newMode)}'. Only downgrades are allowed (auto → half-manual → full-manual).`),
        );
        exitWithCode(1);
      }

      // Apply the mode change
      console.log(chalk.bold(`\n🔄 Converting '${name}' from ${syncModeLabel(currentMode)} → ${syncModeLabel(newMode)}...\n`));

      await updateInstanceSyncMode(name, newMode);

      console.log(chalk.green(`\n✓ Sync mode set to '${syncModeLabel(newMode)}' for '${name}'`));
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
      const [
        instances,
        { runHealthChecks, fixWrapperVersions },
        { tryGetClaudePath },
        { needsInstanceMigration, runInstanceMigrations },
        { loadConfig, saveConfigAtomic },
      ] = await Promise.all([
        listInstances(),
        import("@/health"),
        import("@/wrapper"),
        import("@/migration"),
        import("@/config"),
      ]);

      if (action === "fix") {
        console.log(chalk.bold("\n🔧 Doctor Fix\n"));

        // Verify claude is available
        const claudePath = tryGetClaudePath();
        if (!claudePath) {
          console.error(chalk.red("Claude Code not found in PATH. Please install it first."));
          process.exit(1);
        }
        console.log(chalk.gray(`Using claude at: ${claudePath}`));

        // Fix wrapper versions to point to resolved claude binary
        const fixed = fixWrapperVersions(instances);
        if (fixed.length > 0) {
          console.log(chalk.green(`✓ Fixed ${fixed.length} wrapper(s) to use resolved Claude version:`));
          for (const name of fixed) {
            console.log(chalk.gray(`  • ${name}`));
          }
        } else {
          console.log(chalk.gray("  All wrappers already use the correct Claude version"));
        }

        // Instance migrations
        const fullConfig = await loadConfig();
        if (needsInstanceMigration(fullConfig)) {
          const currentVersion = getClaudeMultiVersion();
          console.log(chalk.cyan(`\nInstance migrations available:`));
          for (const inst of fullConfig.instances) {
            const from = inst.createdWithVersion || "no version";
            console.log(chalk.gray(`  • ${inst.name}: ${from} → v${currentVersion}`));
          }
          const response = await prompts({
            type: "confirm",
            name: "confirm",
            message: "Run instance migrations?",
            initial: true,
          });
          if (response.confirm) {
            const migrated = await runInstanceMigrations(fullConfig);
            await saveConfigAtomic(migrated);
            console.log(chalk.green(`✓ Migrated ${fullConfig.instances.length} instance(s) to v${currentVersion}`));
          }
        }

        console.log(chalk.green("\n✓ Doctor fix complete!"));
      } else {
        // Check mode
        console.log(chalk.bold("\n🔍 Doctor Check\n"));
        const fullConfig = await loadConfig();
        const issues = runHealthChecks(instances, undefined, fullConfig.instanceMigrationVersion);

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

    const results = await Promise.all(instances.map(async (instance) => {
      const plugins = await getEnabledPlugins(instance.configDir);
      return { instance, plugins };
    }));

    for (const { instance, plugins } of results) {
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

  // eslint-disable-next-line @react-doctor/async-await-in-loop -- mutates shared currentPlugins state in place
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
  const [instance, defaultPlugins] = await Promise.all([
    requireInstance(instanceName),
    listAvailablePlugins(),
  ]);
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

  if (isHalfManualSync(instance.configDir)) {
    console.error(chalk.red("✗ Instance has half-manual sync (individually symlinked plugins). Switch to full-manual first."));
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

  if (isHalfManualSync(instance.configDir)) {
    console.error(chalk.red("✗ Instance has half-manual sync (individually symlinked plugins). Switch to full-manual first."));
    exitWithCode(1);
  }

  requireNonEmptyArgs(pluginIds, "✗ No plugins specified", "Usage: claude-multi plugins remove <instance> <plugin-id>...");

  const installed = listInstancePlugins(instance.configDir);
  const installedMap = new Map(installed.map(ip => [ip.id, ip]));
  // eslint-disable-next-line @react-doctor/async-await-in-loop -- shared installed_plugins.json manifest requires sequential writes
  for (const id of pluginIds) {
    const p = installedMap.get(id);
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
    instancesToFix = names.flatMap(name => {
      const found = instances.find(i => i.name === name);
      return found ? [found] : [];
    });
  } else {
    // Interactive selection
    const { selected } = await prompts({
      type: "multiselect",
      name: "selected",
      message: "Select instances to fix:",
      choices: instances.map(i => ({
        title: `${i.name} (${getSyncMode(i)})`,
        value: i.name,
      })),
    });
    instancesToFix = selected.flatMap((name: string) => {
      const found = instances.find(i => i.name === name);
      return found ? [found] : [];
    });
  }

  const fixResults = await Promise.all(instancesToFix.map(async (instance) => {
    const diagnosis = detectBrokenSymlinks(instance.configDir);
    const needsFix = diagnosis.broken.length > 0;
    const mode = getSyncMode(instance);

    let fixed = false;
    if (needsFix) {
      try {
        if (mode === SyncMode.Auto) {
          await syncPluginsAndSkills(instance.configDir);
          fixed = true;
        } else if (mode === SyncMode.HalfManual) {
          await halfSyncPluginsAndSkills(instance.configDir);
          fixed = true;
        }
      } catch { /* fix failed */ }
    }

    return { instance, diagnosis, needsFix, fixed, mode };
  }));

  for (const { instance, diagnosis, needsFix, fixed, mode } of fixResults) {
    console.log(chalk.bold(`\n🔍 ${instance.name}`));
    console.log(`  Config: ${instance.configDir}`);
    console.log(`  Sync mode: ${syncModeLabel(mode)}`);

    if (diagnosis.all.length === 0) {
      console.log(chalk.gray("  No symlinks found (full-manual mode)"));
      continue;
    }

    if (needsFix) {
      console.log(chalk.red(`  ❌ Broken: ${diagnosis.broken.join(", ")}`));

      if (fixed) {
        console.log(chalk.green(`  ✅ Fixed: ${diagnosis.broken.join(", ")}`));
      } else if (mode === SyncMode.FullManual) {
        console.log(chalk.yellow("  ⚠ Full-manual mode — no symlinks to repair."));
      } else {
        console.log(chalk.yellow("  ⚠ Could not auto-repair. Try re-syncing via 'claude-multi auto-sync'."));
      }
    } else {
      console.log(chalk.green(`  ✅ All symlinks OK: ${diagnosis.all.join(", ")}`));
    }
  }

  console.log(chalk.bold("\n✨ Done!"));
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

    const mcpResults = await Promise.all(instances.map(async (instance) => {
      const mcpServers = await listMcpServers(instance.name);
      return { instance, mcpServers };
    }));

    for (const { instance, mcpServers } of mcpResults) {
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
    const [{ render }, React, { App }] = await Promise.all([
      import("ink"),
      import("react"),
      import("./ink/App.js"),
    ]);
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
        await upgradeClaudeMulti();
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

