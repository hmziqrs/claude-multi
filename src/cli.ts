#!/usr/bin/env node

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
  copySettingsFromDefault,
  copyAllFromDefault,
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
} from "./version.ts";

const program = new Command();

program
  .name("claude-multi")
  .description("Manage multiple Claude Code instances with different aliases")
  .version("0.1.0");

// Add command
program
  .command("add <name>")
  .description("Add a new Claude Code instance")
  .option(
    "-c, --config <dir>",
    "Config directory path",
    (name: string) => join(homedir(), `.claude-${name}`)
  )
  .option(
    "-b, --binary <path>",
    "Binary path (default: ~/.local/bin/claude-<name>)"
  )
  .option(
    "--copy-settings",
    "Copy settings.json from default Claude"
  )
  .option(
    "--copy-all",
    "Copy all files from default Claude"
  )
  .option(
    "--skip-prompts",
    "Skip interactive prompts (start fresh)"
  )
  .action(
    async (
      name: string,
      options: {
        config?: string;
        binary?: string;
        copySettings?: boolean;
        copyAll?: boolean;
        skipPrompts?: boolean;
      }
    ) => {
      try {
        const configDir =
          options.config || join(homedir(), `.claude-${name}`);
        const binaryPath =
          options.binary || getDefaultBinaryPath(name);

        // Check if default Claude config exists
        const hasDefaultConfig = hasDefaultClaudeConfig();

        let copySettings = false;
        let copyAllFiles = false;

        // Non-interactive mode (flags provided)
        if (options.copySettings || options.copyAll || options.skipPrompts) {
          if (options.copyAll) {
            copyAllFiles = true;
            copySettings = true;
          } else if (options.copySettings) {
            copySettings = true;
          }
          // skipPrompts means start fresh (both false)
        } else if (hasDefaultConfig) {
          // Interactive mode
          console.log(chalk.gray("\nFound existing Claude Code configuration at ~/.claude"));

          const response = await prompts([
            {
              type: "select",
              name: "copyOption",
              message: "What would you like to copy from default Claude?",
              choices: [
                { title: "Nothing - start fresh", value: "none" },
                { title: "Only settings.json", value: "settings" },
                { title: "All files (settings, CLAUDE.md, plugins, etc.)", value: "all" },
              ],
              initial: 1,
            },
          ]);

          // Handle Ctrl+C
          if (response.copyOption === undefined) {
            console.log(chalk.yellow("\n✗ Cancelled"));
            process.exit(0);
          }

          copySettings = response.copyOption === "settings" || response.copyOption === "all";
          copyAllFiles = response.copyOption === "all";
        }

        const instance: Instance = {
          name,
          configDir,
          binaryPath,
          createdAt: new Date().toISOString(),
        };

        await addInstance(instance);
        await createWrapper(instance);

        // Copy files if requested
        if (copySettings && !copyAllFiles) {
          await copySettingsFromDefault(configDir);
          console.log(chalk.green("✓ Copied settings.json"));
        } else if (copyAllFiles) {
          await copyAllFromDefault(configDir);
          console.log(chalk.green("✓ Copied all files from default Claude"));
        }

        console.log(chalk.green(`\n✓ Instance '${name}' created successfully!`));
        console.log(chalk.gray(`  Binary: ${binaryPath}`));
        console.log(chalk.gray(`  Config: ${configDir}`));
        console.log();

        // Check if binary directory is in PATH
        const binDir = binaryPath.substring(0, binaryPath.lastIndexOf("/"));
        const pathEnv = process.env.PATH || "";
        const isInPath = pathEnv.split(":").some(p => p === binDir);

        if (!isInPath) {
          console.log(chalk.yellow(`⚠ Warning: ${binDir} is not in your PATH`));
          console.log(chalk.gray(`Add to PATH by running:`));
          console.log(chalk.cyan(`  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc`));
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
    }
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
            "Note: Config directory will NOT be deleted automatically."
          )
        );
        console.log(
          chalk.gray(
            "Run with --force to skip this confirmation, or Ctrl+C to cancel."
          )
        );
        console.log();
      }

      await removeInstance(name);
      removeWrapper(instance.binaryPath);

      console.log(chalk.green(`✓ Instance '${name}' removed successfully!`));
      console.log();
      console.log(
        chalk.gray(
          `To remove config files, run: rm -rf ${instance.configDir}`
        )
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
            `  Created: ${new Date(instance.createdAt).toLocaleString()}`
          )
        );
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
        `${chalk.gray("Created:")} ${new Date(instance.createdAt).toLocaleString()}`
      );
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
          `${chalk.gray("Installed:")} ${chalk.cyan(versionInfo.current)}`
        );
      } else {
        console.log(
          chalk.yellow("Claude Code is not installed globally")
        );
      }

      console.log(
        `${chalk.gray("Latest:")}    ${chalk.cyan(versionInfo.latest)}`
      );
      console.log();

      if (versionInfo.updateAvailable) {
        console.log(
          chalk.yellow(`⚠ Update available: ${versionInfo.latest}`)
        );
        console.log(
          chalk.gray("Run 'claude-multi update' to update")
        );
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
          chalk.green(`✓ Already up to date (${versionInfo.current})`)
        );
        return;
      }

      await updateClaudeCode();
    } catch (error) {
      console.error(chalk.red(`✗ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
