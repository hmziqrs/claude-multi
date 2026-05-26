---
title: "Mastering claude-multi: Your Guide to Every Menu & Option"
description: "Dive deep into claude-multi with this comprehensive guide. We'll explore every menu item, from adding instances and managing plugins to syncing skills and seamlessly swapping AI providers. Discover the thoughtful design decisions that make claude-multi indispensable for multi-agent workflows."
date: 2026-05-25
tags: [claude-code, tui, deep-dive]
---

I've been juggling Claude Code with various AI providers for a while now. Anthropic for serious projects, GLM for budget-conscious tests, and DeepSeek when I'm feeling experimental. Initially, it was manageable. Then, the chaos started.

I wasn't *literally* losing files, but every provider switch brought headaches: overwriting `~/.claude/settings.json`, forgetting plugin configurations, mixing up `CLAUDE.md` files across experiments. Once, I even committed a `settings.json` with an incorrect base URL, and it took two days to spot the error.

This frustrating experience is precisely why claude-multi was born. It's a unified environment, a single workflow designed to manage multiple AI providers effortlessly. Each setup is isolated in its own folder. Just launch the TUI, select your desired configuration from a clear menu, and you're good to go.

In this deep dive, we'll walk through every single menu item within the claude-multi TUI. No cryptic flags, no obscure subcommands – just a straightforward, intuitive menu.

## Launching the claude-multi TUI

To begin, simply type `claude-multi` in your terminal. That's it – no complex commands, flags, or subcommands to remember. The interactive terminal UI (TUI) will launch, presenting you with a clear, concise menu like this:

```
🤖 Claude Multi  -  Interactive Mode

2 instance(s): glm, deepseek

  ▸ ➕ Add new instance
    📋 List all instances
    ℹ️  Instance details
    🔌 Manage plugins
    🔄 Toggle auto-sync
    🔗 Re-sync symlinks
    🗑️  Remove instance
    ⚙️  MCP servers
    🚪 Exit
```

Navigating the claude-multi interface is intuitive: use your arrow keys to move, `Enter` to select an option, `ESC` to return to the previous screen, and `q` to quit. These four simple keybindings control the entire application.

## Adding a New claude-multi Instance

This is typically the first step for most users. Select **➕ Add new instance** to launch an intuitive, eight-step setup wizard. I'll guide you through each step, as some choices have implications beyond their initial labels.

### Step 1: Define Your Instance Name

Choose a short, memorable alias for your new instance, such as `glm`, `deepseek`, `work`, or `explore`. This name, consisting of letters, numbers, hyphens, and underscores, isn't just a label—it becomes a direct command on your `PATH`. For example, if you choose `glm`, you'll be able to execute `claude-glm` once the wizard completes.

While provider names like `glm` or `deepseek` are popular and often ideal, a purpose-driven name (e.g., `work`, `cheap`, `explore`) can be equally effective, helping you recall the instance's specific use case months down the line.

### Step 2: Choose Your Provider Template

Here, you'll select a pre-configured template for your AI provider, or opt for `None / Custom` if you prefer to set things up manually later.

These templates aren't magic; they simply automate the process of populating the correct environment variables, such as `ANTHROPIC_BASE_URL` and `ANTHROPIC_MODEL`, directly into your instance's `settings.json`. This feature spares you the hassle of cross-referencing API endpoints and model names across multiple documentation sites.

Currently, we offer templates for GLM (Z.ai), MiniMax, and DeepSeek, with more options on the way.

### Step 3: Enter Your API Key (If Applicable)

This step appears only if you've selected a provider template. Simply paste your API key here. For your security, the key will be masked as you type and then securely written into your instance's `settings.json`. Rest assured, your API key will not be exposed in environment variables or stored in your shell history.

Should you not have your API key readily available, you can press `ESC` to exit and return later. The setup wizard is flexible; you can always re-run it, choose `None / Custom`, and add your key manually at your convenience.

### Step 4: Verify Installation Paths

The wizard will present two default paths for your new instance:

-   **Config:** `~/.claude-<name>/`
-   **Binary:** `~/.local/bin/claude-<name>`

Typically, pressing `y` to accept these defaults is the best choice. The configuration directory thoughtfully mirrors Claude Code's own structure (with a unique suffix), while `~/.local/bin/` serves as the standard location for user binaries on both Linux and macOS. Should you ever need to customize these paths, advanced users can modify the registry manually at a later time.

### Step 5: Configure Copy Options

This is a crucial and highly flexible step, especially if you already have an established `~/.claude/` setup. You have the power to selectively integrate elements from your existing configuration into your new instance:

-   **Nothing.** Opt for a completely fresh start. Your new instance will begin without any pre-existing settings, plugins, or skills—perfect for testing a clean slate.
-   **Only `settings.json`.** Transfer your core settings file while keeping plugins and skills separate. This is ideal when you want to retain your base preferences but experiment with a different model.
-   **Select plugins.** This option allows you to cherry-pick specific plugins from your default installation. Choosing this will advance you to Step 6.
-   **All files.** Copy everything: `settings.json`, your `CLAUDE.md` files, all plugins, and skills. This comprehensive transfer proceeds to Step 7.

I almost always pick "All files." Setting up plugins twice is annoying. But if I'm testing something weird, "Nothing" is the right call.

### Step 6: Curate Your Plugins (If "Select plugins" was chosen)

If you chose to "Select plugins" in the previous step, you'll be presented with a multi-select list showcasing every plugin available in your default `~/.claude/` installation. Use the `space` key to toggle your selections and `enter` to confirm. The wizard will then meticulously copy only the plugins you've checked into your new instance.

This option is perfect for those who prefer precision. You gain the advantage of leveraging your established plugin library without inadvertently carrying over any experimental or potentially unstable plugins.

### Step 7: Configure Auto-Sync for Plugins and Skills (If "All files" was chosen)

When you opt for "All files," the wizard will prompt you whether you'd like to symlink the `plugins/` and `skills/` directories back to your default `~/.claude/` setup.

*   **Saying `y`** transforms these folders into symbolic links. This means that any plugin or skill you install in your default Claude Code environment will instantly become available across all instances that have auto-sync enabled. It's the ideal choice for maintaining a single source of truth and avoiding redundant installations.
*   **Opting for `n`** ensures that plugins and skills are fully copied into your new instance, allowing them to operate completely independently. This is particularly useful for isolated experiments where you want to freely modify plugins without impacting your primary setup.

Remember, this decision isn't permanent; you can always adjust your auto-sync preferences later via a dedicated menu option.

### Step 8: Instance Creation Complete!

Upon successful completion, the wizard finalizes all configurations and presents a clear confirmation, detailing the paths for your newly created instance:

```
✓ Instance 'glm' created successfully!
  ├─ Binary: /Users/you/.local/bin/claude-glm
  └─ Config: /Users/you/.claude-glm
```

You're all set! Now, simply execute `claude-glm` (or whatever name you chose). You'll immediately launch a full Claude Code session, seamlessly connected to your chosen AI provider, complete with its own isolated configuration, command history, and plugins. It's the same powerful `claude` binary, now intelligently directed to a distinct operational environment.

## List All Instances

Accessing **📋 List all instances** provides a quick, at-a-glance overview of your entire `claude-multi` ecosystem. This screen displays every instance you've configured, detailing its associated provider, installation paths, and current sync status. It's an invaluable resource for when you need a reminder of your setups, especially those created weeks or months prior.

## Dive Deeper: Instance Details

**ℹ️ Instance details** offers a comprehensive look into any specific `claude-multi` instance. After selecting an instance, you'll gain access to its complete configuration: the location of its files, which plugins are currently active, a snapshot of its `settings.json` file, and its auto-sync status. This view is my go-to for troubleshooting—it helps me quickly confirm the state of an instance before making any adjustments.

## Master Your Extensions: Manage Plugins

The **🔌 Manage plugins** menu is often where I spend most of my time. This two-step process begins by selecting the instance you wish to modify. Following that, you'll see a dynamic list of every plugin residing within that instance's configuration directory, each accompanied by intuitive toggle controls.

From this central hub, you have several powerful options:

-   **Activate or Deactivate:** Effortlessly enable or disable a plugin without needing to uninstall it.
-   **Install New Plugins:** Add a new plugin directly into this specific instance, keeping it isolated if desired.
-   **Manual Plugin Copy:** Manually copy a plugin from your default `~/.claude/` setup into this instance, offering precise control over your plugin ecosystem.
-   **Remove Plugins:** Completely uninstall a plugin from the instance.

The key distinction lies in auto-sync: if it's enabled for an instance, the plugin list acts as a direct window into your default `~/.claude/` installation, ensuring changes propagate universally. If auto-sync is off, the instance's plugin configuration remains entirely independent.

Furthermore, `claude-multi` intelligently performs a collision check during installation. If a new plugin might conflict with an existing one (e.g., due to identical names or version discrepancies), the TUI will alert you before any changes are committed, preventing potential issues.

## Effortlessly Toggle Auto-Sync

The **🔄 Toggle auto-sync** feature performs precisely as its name suggests. Simply select an instance and flip the switch. When activated, `claude-multi` intelligently rebuilds the symbolic links for your `plugins/` and `skills/` directories. Conversely, disabling it converts them back into independent folders.

I've personally found this invaluable when I've initially set up instances without sync, only to later realize I wanted to centralize my plugin library. The process is quick and seamless.

## Restore Harmony: Re-sync Symlinks

Consider **🔗 Re-sync symlinks** your essential repair tool. If you've ever relocated your `~/.claude/` directory, renamed a file, or inadvertently deleted a plugin that another instance relied on, this function efficiently rebuilds those critical links. You have the flexibility to run it for a single instance or across all of them simultaneously.

While you might not use this feature frequently, it's the first place to turn when something feels amiss with your `claude-multi` setup.

## Clean Up Your Workspace: Remove Instance

The **🗑️ Remove instance** option allows you to cleanly delete an instance, its associated wrapper script, and (optionally) its configuration directory. For your safety, the wizard will always ask for confirmation before removing the config directory, giving you the choice to preserve your data if you envision returning to it later.

This is also your go-to option if you've made a typo during instance creation – simply remove the incorrect instance and start fresh.

## Centralized MCP Server Management

The **⚙️ MCP servers** menu provides robust management for your Model Context Protocol (MCP) configurations. Here, you can easily view which MCP servers are associated with each instance and, crucially, seamlessly copy server configurations between your instances.

This feature is a significant time-saver. If you've invested effort in meticulously setting up an MCP server within your primary Claude Code installation, you won't need to repeat that work for every new instance. Simply select your source instance, choose the destination, and `claude-multi` handles the configuration transfer.

## Proactive Health Warnings

`claude-multi` keeps a vigilant eye on your setup. If any issues arise, the main menu will prominently display a colored banner at the top—yellow for warnings, red for more critical errors. By pressing `!` from the menu, you'll access a dedicated health screen that meticulously lists every detected problem, such as a missing binary, a broken symbolic link, a stale registry entry, or a configuration directory that has been inadvertently removed.

Each identified issue is accompanied by a suggested action. This means you won't have to manually dig through directories to diagnose problems; the TUI provides clear guidance, and in most cases, can even resolve the issue for you automatically.

## Beyond the Menus: Automatic Behaviors You Should Know

While the TUI provides direct control, some essential functionalities operate seamlessly in the background, making your `claude-multi` experience even smoother.

**Effortless Path Setup.** The very first time you create an instance, `claude-multi` intelligently places its wrapper script in `~/.local/bin/`. If this directory isn't yet part of your system's `PATH`, your new `claude-<name>` commands won't be recognized. A simple, one-time addition to your shell configuration resolves this:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

This is a global adjustment, not something you'll repeat for every instance.

**The Clever Wrapper Script.** Each `claude-<name>` command is powered by a remarkably lightweight script. Its sole purpose is to set the `CLAUDE_CONFIG_DIR` to your instance's specific configuration directory before executing the standard `claude` binary. There's no complex forking, no strange patching—just a direct, efficient handover. This elegant design ensures that when Claude Code releases an update, all your `claude-multi` instances automatically benefit, as they all share the same core binary.

**Graceful UI Fallback.** Should the rich Ink-based TUI encounter rendering issues on your terminal (which can occasionally happen with certain SSH setups or older terminals), `claude-multi` offers a practical fallback: a prompt-based UI. Simply launch it with:

```bash
CLAUDE_MULTI_INK=false claude-multi
```

You'll access the same powerful flows and screens, just with a simplified rendering interface.

## The Power of a Unified Menu: Why This Design Choice Matters

Before settling on the current TUI, I explored several alternatives. The initial flag-based version, while functional, became a memory test—I could never recall the specific flags a day later. A subsequent guided prompts UI was an improvement, but it annoyingly asked the same questions repeatedly, even for quick tasks like enabling a single plugin.

The unified menu system masterfully solved both these challenges, offering both **discovery** and **depth**. New users can effortlessly explore every available option without needing to consult external documentation. Experienced users can swiftly navigate directly to their desired menu item, bypassing unnecessary prompts. The result? Nobody needs to memorize anything.

If there's one key takeaway I hope you gain from this post, it's this: take a few minutes to type `claude-multi` and simply explore the menu. You'll find that the entire application's logic becomes clear after just five minutes. There are no hidden functionalities behind obscure flags, no critical settings buried deep within configuration files. The menu truly is the entire surface area of `claude-multi`.

And frankly, that simplicity is the whole pitch.
