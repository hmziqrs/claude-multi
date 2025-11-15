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
  hasDefaultMcpConfig,
  copySettingsFromDefault,
  copyAllFromDefault,
  copyMcpServersFromDefault,
  copyMcpServersBetweenInstances,
  listMcpServers,
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

        // Non-interactive mode (flags provided)
        if (
          options.copySettings ||
          options.copyAll ||
          options.copyMcp ||
          options.skipPrompts
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
          await copyAllFromDefault(configDir);
          console.log(chalk.green("✓ Copied all files from default Claude"));
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

  const instance: Instance = {
    name,
    configDir,
    binaryPath,
    createdAt: new Date().toISOString(),
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
    await copyAllFromDefault(configDir);
    console.log(chalk.green("✓ Copied all files from default Claude"));
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
