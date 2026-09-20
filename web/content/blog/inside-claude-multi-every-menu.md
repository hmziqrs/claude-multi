---
title: "Inside claude-multi: a tour of every menu"
description: "A walkthrough of every screen in the claude-multi TUI. What each option does, when to use it, and the design calls I made along the way."
date: 2026-05-25
tags: [claude-code, tui, deep-dive]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/inside-claude-multi-every-menu.mp3"
---

I've been running Claude Code against several providers for a while. Anthropic for the work I care about, GLM when I want to burn fewer tokens, DeepSeek when I'm curious. For a while this was fine. Then it wasn't.

The problem was never any one provider. It was the switching. Overwriting `~/.claude/settings.json` between sessions. Forgetting which plugins were installed where. Once I committed a `settings.json` with the wrong base URL and didn't notice for two days.

That is what claude-multi is. One environment, one workflow, each provider in its own folder. You launch the TUI, pick what you need, you're done. No subcommands, no flags.

This post is a full walk through every menu item. If you're trying to figure out whether the thing covers what you need, this should answer that.

## Launching the TUI

You type `claude-multi`. That's it.

```
🤖 Claude Multi  -  Interactive Mode

2 instance(s): glm, deepseek

  ▸ ➕ Add new instance
    📋 List all instances
    ℹ️  Instance details
    🔌 Manage plugins
    🔄 Sync mode
    🔗 Re-sync symlinks
    🗑️  Remove instance
    ⚙️  MCP servers
    🚪 Exit
```

Arrow keys to move. `Enter` to select. `ESC` to go back. `q` to quit. Those four keys control everything.

## Adding a new instance

The menu items show up with little emoji icons next to them; below I'll refer to them by name alone. The first one to pick is Add new instance. The wizard has eight steps. A couple of them have implications worth flagging.

### Step 1: instance name

Something short. `glm`, `deepseek`, `work`, `explore`. Letters, numbers, hyphens, underscores. This name becomes the command on your `PATH`, so `glm` gives you `claude-glm`.

Provider names are the obvious choice. Purpose names like `work` or `cheap` also work and are sometimes easier to remember three months later.

### Step 2: provider template

Pick a template, or `None / Custom` if you want to wire things up yourself.

The templates are not magic. They just write the right env vars (`ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, a few others) into the instance's `settings.json`. The value is that you don't have to find the right URLs and model names across four different docs sites.

Current templates: GLM (Z.ai), MiniMax, DeepSeek. More on the way.

### Step 3: API key (if you picked a provider)

Paste the key. It's masked while you type and written into the instance's `settings.json`. It does not go into environment variables and it does not end up in your shell history.

If you don't have the key in front of you, hit `ESC`. You can re-run the wizard later with `None / Custom` and add the key by hand.

### Step 4: confirm paths

Two defaults:

- Config: `~/.claude-<name>/`
- Binary: `~/.local/bin/claude-<name>`

`y` to accept. The config layout mirrors Claude Code's own. `~/.local/bin` is the standard user-binary location on Linux and macOS. If you want different paths, you can edit the registry by hand later.

### Step 5: copy options

This is the step that matters most if you already have a `~/.claude` setup.

- Nothing. Start clean. No settings, no plugins, no skills. Good for testing.
- Only `settings.json`. Carry over your base settings but leave plugins and skills out. Useful when you want the same preferences with a different model.
- Select plugins. Cherry-pick. Goes to Step 6.
- All files. Settings, `CLAUDE.md`, plugins, skills, the whole thing. Goes to Step 7.

I almost always pick "All files." Setting up plugins twice is annoying. But if I'm testing something weird, "Nothing" is the right call.

### Step 6: select plugins (if "Select plugins")

A multi-select list of every plugin in your default `~/.claude`. `space` toggles, `enter` confirms. Only the checked ones get copied.

Useful when you have a few plugins you trust and a bunch you're still evaluating.

### Step 7: sync mode (if "All files")

The wizard asks how this instance's `plugins/` and `skills/` should relate to your default `~/.claude/`.

- Auto. Those folders become symlinks. Install a plugin once in your default Claude, every synced instance sees it. One source of truth.
- Half-manual. Real folders, but each plugin and skill inside is individually symlinked. You get the existing set, but new installs in `~/.claude` don't appear until you re-sync.
- Full-manual. Copies. The instance can drift from your default without affecting it. Good for isolated experiments.

You can change this later, but only downward (auto → half-manual → full-manual), not back up.

### Step 8: done

```
✓ Instance 'glm' created successfully!
  ├─ Binary: /Users/you/.local/bin/claude-glm
  └─ Config: /Users/you/.claude-glm
```

Run `claude-glm`. You get a full Claude Code session pointed at the provider you picked, with its own config, history, and plugins. Same `claude` binary, different brain.

## List all instances

This screen lists everything you've set up: name, provider, paths, sync status. Useful for remembering what you have. Especially the ones you created six weeks ago and forgot about.

## Instance details

Instance details is the deeper view of a single instance: where its files live, which plugins are active, a snapshot of `settings.json`, the sync mode. This is the screen I open when something is misbehaving and I want to confirm the state before I touch anything.

## Manage plugins

Manage plugins is where I spend most of my time. Pick an instance, then you get a list of every plugin in its config dir with toggle controls.

From there:

- Enable or disable a plugin without uninstalling it.
- Install a new plugin into this specific instance.
- Copy a plugin from your default `~/.claude/` into this instance by hand.
- Remove a plugin completely.

Sync mode is the thing to keep in mind. In auto or half-manual mode the plugin list is partly a view onto your default `~/.claude/` install, so changes propagate (and in half-manual mode, per-plugin install and remove are blocked). In full-manual mode the instance's plugin set is entirely its own.

claude-multi also runs a collision check on install. If a new plugin would clash with one already there (same name, version mismatch, that kind of thing), the TUI flags it before writing anything.

## Sync mode

Sync mode lets you pick auto, half-manual, or full-manual for an instance. The current mode gets a color label, and the screen shows which downgrades are available, since conversions only go one way (auto → half-manual → full-manual). There's also a Force re-sync option that rebuilds the symlinks without changing the mode.

I use this when I've created an instance without sync and decide later that I want some of it after all.

## Re-sync symlinks

Re-sync symlinks is the repair tool. If you moved `~/.claude/`, renamed something, or deleted a plugin another instance was pointing at, this rebuilds the broken links. You can run it for one instance or for all of them.

You won't reach for it often. When something looks wrong, this is the first thing to try.

## Remove instance

Remove instance cleanly deletes an instance and its wrapper. It asks whether you also want to delete the config directory, with a confirmation either way, so your history isn't wiped without you noticing.

Also useful if you fat-fingered the name during setup and just want to start over.

## MCP servers

MCP servers lets you view MCP server configs per instance and copy them between instances. If you put effort into wiring up MCP for your main Claude Code setup, you don't have to redo that work for every new provider. Pick a source, pick a destination, done.

## Health warnings

claude-multi watches the setup in the background. If something is wrong, the main menu shows a banner: yellow for warnings, red for the things you should fix now. Press `!` to open the health screen, which lists every detected issue (missing binary, broken symlink, stale registry entry, missing config dir) with a suggested fix.

Most of the time it can fix the issue for you automatically.

## A few things that happen without you doing anything

Path setup. The first time you create an instance, claude-multi drops the wrapper into `~/.local/bin/`. If that's not on your `PATH`, the new `claude-<name>` won't run. The fix is a one-line addition to your shell config:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

You do this once, not per instance.

The wrapper script. Every `claude-<name>` is a tiny script. It sets `CLAUDE_CONFIG_DIR` to the instance's config directory and then runs the regular `claude` binary. No forking, no patching: when Claude Code updates, every instance gets the update at the same time because they all share the same binary.

Fallback UI. If the Ink TUI doesn't render on your terminal (some SSH setups, some older terminals), there's a prompt-based UI:

```bash
CLAUDE_MULTI_INK=false claude-multi
```

Same flows, simpler rendering.

## Why the menu, instead of flags

I tried two other versions of this before landing on the menu.

The flag-based one worked but I could never remember the flags. I'd write a command, get a usage error, look up the flags, type it again. Every time.

The guided prompts UI was better but it asked the same questions in the same order whether you were creating a new instance or toggling one plugin. Faster than reading docs, slower than it should have been.

The menu does both. New users can poke around and find every feature without reading anything. Repeat users jump straight to the screen they want. Nobody has to memorize anything.

If you take one thing from this post: spend five minutes inside `claude-multi` and click around. The whole tool is the menu. There are no hidden flags, no secret configs. What you see is what you get.

That simplicity is the whole pitch.
