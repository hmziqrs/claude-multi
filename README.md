<div align="center">

<img src="public/favicon-animated.svg" width="256" height="256" alt="claude-multi logo">

<h1 align="center">claude-multi</h1>

<p align="center">
  Run multiple isolated Claude Code instances side by side. Each one gets its own provider, config directory, plugins, MCP servers, and <code>claude-&lt;name&gt;</code> command.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/claude-multi"><img src="https://img.shields.io/npm/v/claude-multi?style=flat-square" alt="npm version" /></a>
  <a href="https://github.com/hmziqrs/claude-multi/blob/master/LICENSE"><img src="https://img.shields.io/github/license/hmziqrs/claude-multi?style=flat-square" alt="license" /></a>
  <a href="https://github.com/hmziqrs/claude-multi"><img src="https://img.shields.io/github/stars/hmziqrs/claude-multi?style=flat-square" alt="GitHub stars" /></a>
</p>

---
</div>

## Why?

Claude Code is great. Switching between providers and model setups is not.

If you want to try GLM today and DeepSeek tomorrow, you usually end up editing `settings.json` by hand, juggling env vars, swapping keys, or maintaining a bunch of shell aliases nobody asked for.

The other option is to use each provider's own CLI tool. That sounds clean until you realize every tool has its own workflow, its own flags, its own way of doing things. Learning a new harness for every model gets old fast.

So I went the other way: keep one harness I already like, and put the providers behind it. That's claude-multi. One workflow, many providers.

And because it's still Claude Code under the hood, you keep everything you already use. `/loop`, `/goal`, skills, MCP servers, plugins, all of it. Switching providers does not mean rebuilding your setup from scratch.

```bash
claude          # your normal Claude Code setup
claude-glm      # Claude Code using GLM / Z.ai config
claude-deepseek # Claude Code using DeepSeek config
claude-minimax  # Claude Code using MiniMax config
```

Each instance is isolated. All of them run the normal, unmodified Claude Code binary.

---

## Features

* Multiple Claude Code instances, one `claude-<name>` command each.
* Provider templates for GLM/Z.ai, MiniMax, and DeepSeek.
* Isolated config directories. Every instance gets its own `~/.claude-<name>/`.
* A full terminal UI that covers adding, listing, plugins, MCP, and sync.
* Plugin management per instance: enable, disable, install, copy, remove.
* MCP management: list and copy server configs between instances.
* Optional auto-sync that symlinks plugins and skills from your default `~/.claude`.
* No fork. It wraps your existing `claude` binary instead of patching it.

---

## Requirements

* Node.js 18+ or Bun 1+
* Claude Code installed globally

If you don't have Claude Code yet:

```bash
npm install -g @anthropic-ai/claude-code
```

---

## Install

Bun:

```bash
bun add -g claude-multi
```

npm:

```bash
npm install -g claude-multi
```

pnpm:

```bash
pnpm add -g claude-multi
```

Deno:

```bash
deno install -g -A -n claude-multi npm:claude-multi
```

---

## Getting started

Launch the TUI:

```bash
claude-multi
```

That's the only command you need to remember. Everything else lives inside the terminal UI.

### The main menu

When the TUI opens, you get something like this:

```
🤖 Claude Multi  -  Interactive Mode

  ➕ Add new instance
  📋 List all instances
  ℹ️  Instance details
  🔌 Manage plugins
  🔄 Toggle auto-sync
  🔗 Re-sync symlinks
  🗑️  Remove instance
  ⚙️  MCP servers
  🚪 Exit
```

Arrow keys to move. `Enter` to pick. `ESC` to go back. `q` to quit.

### Setting up your first instance

Pick **➕ Add new instance**. The wizard has eight steps.

**1. Instance name**

Pick something short like `glm`, `deepseek`, or `work`. Letters, numbers, hyphens, and underscores only. Whatever you type here becomes your command, so `glm` gives you `claude-glm`.

**2. Provider template**

Pick one:

* `glm` for GLM / Z.ai
* `minimax` for MiniMax
* `deepseek` for DeepSeek
* `None / Custom` if you want to set things up by hand later

**3. API key** *(only if you picked a provider)*

Paste your key. It's masked while you type and gets written into the instance's `settings.json`.

**4. Confirm paths**

The wizard shows where things will go:

* Config: `~/.claude-<name>/`
* Binary: `~/.local/bin/claude-<name>`

Hit `y` to accept. The defaults are fine for almost everyone.

**5. Copy options**

If you already have a `~/.claude` setup, you can carry pieces of it into the new instance:

* **Nothing.** Start fresh, inherit nothing.
* **Only `settings.json`.** Copy just the base settings file.
* **Select plugins.** Cherry-pick plugins from your default setup.
* **All files.** Settings, `CLAUDE.md`, plugins, skills, the whole thing.

**6. Select plugins** *(only if you picked "Select plugins")*

A multi-select list of every plugin in your default `~/.claude`. `space` toggles. `enter` confirms.

**7. Auto-sync** *(only if you picked "All files")*

This asks whether to symlink `plugins/` and `skills/` back to `~/.claude`. Say `y` if you want to install a plugin once and have it show up in every instance. Say `n` if you want this instance to have its own independent copies.

**8. Done**

The wizard prints the new instance and its paths:

```
✓ Instance 'glm' created successfully!
  ├─ Binary: /Users/you/.local/bin/claude-glm
  └─ Config: /Users/you/.claude-glm
```

Run it:

```bash
claude-glm
```

That's a full Claude Code session on the provider you picked, with its own isolated config. Same `claude` you already know, just pointed at a different brain.

### Other TUI flows

* **📋 List all instances.** Every instance with its provider, paths, and sync status.
* **ℹ️ Instance details.** Pick one to inspect its full config.
* **🔌 Manage plugins.** Pick an instance, then enable, disable, install, copy, or remove plugins for it.
* **🔄 Toggle auto-sync.** Flip symlink syncing on or off for a chosen instance.
* **🔗 Re-sync symlinks.** Rebuild broken plugin or skill symlinks after you've moved `~/.claude` around.
* **🗑️ Remove instance.** Delete an instance, its wrapper, and optionally its config dir.
* **⚙️ MCP servers.** View MCP configs and copy them between instances.

If the menu shows a `!` health hint, press `!` to see what's wrong and fix it.

---

## Providers

| Provider | Endpoint | Template name |
|---|---|---|
| GLM (智谱AI) | `api.z.ai` | `glm` |
| MiniMax | `api.minimax.io` | `minimax` |
| DeepSeek | `api.deepseek.com` | `deepseek` |

The templates write `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, and a few related env vars into `~/.claude-<name>/settings.json`. Edit that file if you want to tweak things further.

---

## How it works

Every instance gets a config dir at `~/.claude-<name>/` and a wrapper script at `~/.local/bin/claude-<name>`. The wrapper sets `CLAUDE_CONFIG_DIR` and then runs the unmodified `claude` binary. No fork, no patch.

```js
#!/usr/bin/env bun
process.env.CLAUDE_CONFIG_DIR = "/Users/you/.claude-glm"
spawn("claude", process.argv.slice(2), { stdio: "inherit", env: process.env })
```

Instance metadata sits in `~/.claude-multi/config.json`. When auto-sync is on, `plugins/` and `skills/` are symlinks back to `~/.claude/`, so installing a plugin once makes it show up everywhere.

---

## File locations

| Path | Purpose |
|---|---|
| `~/.claude-multi/config.json` | claude-multi instance registry |
| `~/.claude-<name>/` | config directory for one instance |
| `~/.local/bin/claude-<name>` | generated wrapper command on Linux/macOS |
| `~/.claude/` | your default Claude Code config. Treated as the source for copy and sync operations. |

---

## Auto-sync vs manual mode

With auto-sync on, `plugins/` and `skills/` are symlinks pointing at your default `~/.claude/`. Install a plugin once, and every instance that opted in picks it up.

Use manual mode when you want an instance that's fully independent. Just say `n` at the auto-sync step in the wizard. You can also flip this later from the main menu under **🔄 Toggle auto-sync**.

---

## Troubleshooting

### `claude-<name>` command not found

Your global binary directory probably isn't on `PATH`.

For zsh on Linux/macOS:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

For Bash:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Broken plugin or skill symlinks

Open the TUI and pick **🔗 Re-sync symlinks**. Choose the broken instance (or all of them) and it rebuilds the links.

### Health warnings in the menu

If the main menu shows a yellow or red banner, hit `!` to open the health screen. It lists what's wrong (missing binary, broken symlinks, stale registry entries, that kind of thing) and offers fixes for each one.

### Force the simpler prompts UI

If the Ink TUI doesn't render right on your terminal:

```bash
CLAUDE_MULTI_INK=false claude-multi
```

You get a basic prompt-based UI with the same flows.

---

## Roadmap ideas

* More provider templates
* Better docs for provider-specific models
* Import and export instance profiles
* Safer API key management
* Preset workflows for coding, planning, review, and cheap exploration models

---

## License

MIT. See [LICENSE](./LICENSE) for the full text. Copyright (c) 2026 hmziqrs.
