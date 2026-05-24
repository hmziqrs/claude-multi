---
title: "Inside claude-multi: every menu, every option"
description: "A walkthrough of every feature in claude-multi, one menu item at a time. Adding instances, managing plugins, syncing skills, swapping providers, and the small things that made me build this in the first place."
date: 2026-05-25
tags: [claude-code, tui, deep-dive]
---

I've been running Claude Code against three different providers for a while now. Anthropic for the real work, GLM when I want to try something cheaper, DeepSeek when I'm in the mood to experiment. The first month was fine. The second month I started losing files.

Not literally losing them. But every time I switched providers I'd overwrite my `~/.claude/settings.json`, half-remember which plugins I'd disabled where, forget which `CLAUDE.md` belonged to which experiment. Once I committed a `settings.json` with the wrong base URL and didn't notice for two days.

That's the whole reason claude-multi exists. One harness, one workflow, many providers. Each one isolated in its own folder. You launch the TUI, you pick what you want from a menu, you're done.

This post walks through every menu item in that TUI. No flags. No subcommands. Just the menu.

## Opening the TUI

You type `claude-multi`. That's the whole entry point. There is no second command, no flags, no subcommand to memorize. The terminal UI opens and shows you something like this:

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

Arrow keys to navigate. `Enter` to pick. `ESC` to back out of any screen. `q` to quit. Those four keys cover the entire app.

## Adding an instance

This is where most people start. Pick **➕ Add new instance** and you get an eight-step wizard. I'll walk through each step in order because the choices matter and most of them aren't obvious from the labels.

### Step 1: Instance name

Type a short alias. `glm`, `deepseek`, `work`, `cheap`, whatever you want. Letters, numbers, hyphens, and underscores. The name you pick here becomes a real command on your `PATH`. Type `glm` and you can run `claude-glm` after the wizard finishes. Type `work` and you get `claude-work`.

I've gone back and forth on naming conventions. Provider name (`glm`, `deepseek`) is the most popular choice and probably what you want. But "purpose name" (`work`, `cheap`, `explore`) works too, especially if you want to remember why you set it up six months from now.

### Step 2: Provider template

Pick one of the templates, or pick `None / Custom` to skip and configure by hand later.

The templates write the right environment variables into the instance's `settings.json`. `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, and a few related ones. That's it. There's no magic. The template just saves you from looking up endpoints and model names in three different docs sites.

Current templates: GLM (Z.ai), MiniMax, DeepSeek. More coming.

### Step 3: API key

This only shows up if you picked a provider template. Paste your key. It's masked while you type, and it gets written into the instance's `settings.json`. Nothing lives in environment variables, nothing lives in your shell history.

If you don't have a key handy, hit `ESC` and come back later. You can run the wizard again and pick `None / Custom`, then add the key by hand. The wizard doesn't lock you in.

### Step 4: Confirm paths

The wizard shows you two default paths:

- Config: `~/.claude-<name>/`
- Binary: `~/.local/bin/claude-<name>`

Hit `y`. The defaults work for almost everyone. The config dir mirrors what Claude Code itself uses (just with a suffix), and `~/.local/bin/` is the standard user-binary location on Linux and macOS. If you ever need to customize either, you can edit the registry by hand later.

### Step 5: Copy options

This is the most interesting step. If you already have a working `~/.claude/` setup, you can pull pieces of it into the new instance:

- **Nothing.** Start fresh. The instance has no settings, no plugins, no skills. Useful if you want to test a clean slate.
- **Only `settings.json`.** Copy your base settings file but leave plugins and skills alone. Good for when you want the same defaults but a different model.
- **Select plugins.** Cherry-pick specific plugins from your default install. Goes to step 6.
- **All files.** Copy `settings.json`, `CLAUDE.md`, plugins, skills, the whole tree. Goes to step 7.

I almost always pick "All files." Setting up plugins twice is annoying. But if I'm testing something weird, "Nothing" is the right call.

### Step 6: Select plugins (only if you picked "Select plugins")

A multi-select list of every plugin in your default `~/.claude`. `space` toggles. `enter` confirms. The wizard copies only the ones you check.

This is the option for the careful crowd. You get the benefit of your existing plugin library without dragging the half-broken ones along for the ride.

### Step 7: Auto-sync (only if you picked "All files")

The wizard asks whether you want to symlink the `plugins/` and `skills/` directories back to your default `~/.claude/`.

If you say `y`, those folders become symlinks. Install a plugin once in your default Claude Code setup, and every instance that opted in sees it immediately. Same for skills. This is the option for people who want one source of truth and don't want to install the same plugin five times.

If you say `n`, the plugins and skills get fully copied into the new instance and stay independent. Useful for experiments where you want to mess with plugins without affecting your main setup.

You can change your mind later. There's a menu item for exactly that.

### Step 8: Done

The wizard writes everything to disk and prints a confirmation:

```
✓ Instance 'glm' created successfully!
  ├─ Binary: /Users/you/.local/bin/claude-glm
  └─ Config: /Users/you/.claude-glm
```

Now run `claude-glm`. You get a full Claude Code session on the provider you picked, with its own isolated config, its own history, its own plugins. Same `claude` binary, just pointed at a different brain.

## List all instances

The simplest screen in the app. **📋 List all instances** shows you every instance you've created, the provider it uses, its paths, and its sync status. Useful when you've forgotten what you set up six weeks ago.

## Instance details

**ℹ️ Instance details** is the deeper version. Pick an instance and you see its full config: where everything lives, which plugins are enabled, what its `settings.json` looks like at a glance, whether auto-sync is on. It's the screen I use when something seems off and I want to confirm reality before I touch anything.

## Manage plugins

**🔌 Manage plugins** is where most of my time goes. The flow is two steps. First you pick an instance. Then you get a list of every plugin currently in that instance's config dir, with toggle controls for each one.

From there you can:

- Enable or disable a plugin without uninstalling it
- Install a new plugin into this instance only
- Copy a plugin from your default `~/.claude/` into this instance (the manual version of auto-sync)
- Remove a plugin completely

If auto-sync is on for the instance, the plugin list is a view into your default install. Changes you make sync everywhere. If auto-sync is off, the list is independent. That's the entire mental model.

There's also a collision-check that runs when you install. If a plugin you're adding would clash with an existing one (same name, different version, that kind of thing), the TUI tells you before you commit.

## Toggle auto-sync

**🔄 Toggle auto-sync** does exactly what it says. Pick an instance, flip the switch. If you turn it on, the wrapper rebuilds the `plugins/` and `skills/` symlinks. If you turn it off, it converts them back into independent folders.

I've flipped this on instances I originally created without sync, then realized I wanted to share my plugin library. Took two seconds.

## Re-sync symlinks

**🔗 Re-sync symlinks** is a repair tool. If you've moved your `~/.claude/` around, renamed something, deleted a plugin that another instance was symlinked to, this rebuilds the chain. You can run it against a single instance or against all of them at once.

You probably won't need this often. But when something feels broken, this is the first thing to try.

## Remove instance

**🗑️ Remove instance** deletes an instance, its wrapper script, and (optionally) its config directory. The wizard asks before it nukes the config dir, so you can keep the data around if you want to come back to it later.

This is also where you go if you typo'd the instance name during creation. Just remove it and start over.

## MCP servers

**⚙️ MCP servers** handles Model Context Protocol configs. You can list which MCP servers are configured per instance and copy server configs between instances.

If you've spent ten minutes setting up an MCP server in your main Claude Code install and don't want to repeat the work, this is the screen. Pick the source instance, pick the destination, the configs move over.

## Health warnings

If anything's wrong, the main menu shows a colored banner at the top. Yellow for warnings, red for errors. Press `!` from the menu and you get a dedicated health screen listing every issue: a missing binary, a broken symlink, a stale registry entry, a config dir that's been deleted out from under the wrapper.

Each issue comes with an action. You don't have to dig through directories to figure out what's wrong. The TUI tells you, and most of the time it can fix the problem for you.

## The pieces that aren't in any menu

A few things happen automatically. They're worth knowing about.

**Path setup.** The first time you create an instance, the wrapper script goes to `~/.local/bin/`. If that's not on your `PATH`, the new `claude-<name>` command won't be found. Add this to your shell config:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

That's a one-time setup, not a per-instance thing.

**The wrapper itself.** Every `claude-<name>` command is a tiny script that sets `CLAUDE_CONFIG_DIR` to the instance's config dir and then runs the normal `claude` binary. No fork, no patch, nothing weird. If Claude Code ships an update, all your instances pick it up automatically because they're all just running the same binary.

**Falling back to a simpler UI.** If the Ink-based TUI doesn't render right on your terminal (some SSH setups, some legacy terminals), you can fall back to a prompt-based UI:

```bash
CLAUDE_MULTI_INK=false claude-multi
```

Same flows, same screens, simpler rendering.

## Why I built this in one menu

I tried a bunch of approaches before settling on the TUI. The first version was flag-based. It worked but I couldn't remember any of the flags two days later. The second version was a guided prompts UI. Better but it asked the same questions every single time, even when I just wanted to enable a plugin.

The menu solved both problems. Discovery and depth. New users see every option laid out, no documentation required. Experienced users hit the menu item they want and move on. Nobody has to memorize anything.

If there's one thing I want this post to do, it's convince you to type `claude-multi` and just poke around the menu. The whole app fits in your head after about five minutes. There's nothing hidden behind a flag, nothing buried in a config file you have to find. The menu is the entire surface area.

That's the whole pitch, honestly.
