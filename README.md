<div align="center">

<img src="public/favicon-animated.svg" width="256" height="256" alt="claude-multi logo">

<h1 align="center">claude-multi</h1>

<p align="center">
  Run multiple isolated Claude Code instances side by side — each with its own provider, config directory, plugins, MCP servers, and <code>claude-&lt;name&gt;</code> command.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/claude-multi"><img src="https://img.shields.io/npm/v/claude-multi?style=flat-square" alt="npm version" /></a>
  <a href="https://github.com/hmziqrs/claude-multi/blob/master/LICENSE"><img src="https://img.shields.io/github/license/hmziqrs/claude-multi?style=flat-square" alt="license" /></a>
  <a href="https://github.com/hmziqrs/claude-multi"><img src="https://img.shields.io/github/stars/hmziqrs/claude-multi?style=flat-square" alt="GitHub stars" /></a>
</p>

---
</div>

## Why?

Claude Code is great, but switching between different providers or model setups can get annoying fast.

Normally you end up editing config files, changing environment variables, swapping API keys, or keeping separate shell aliases around.

Most AI providers also have their own CLI tools, each with their own workflows and conventions. Learning a new tool for every provider you want to try adds up, and context-switching between them breaks flow.

A more natural approach: one harness you already know well, with multiple providers behind it. `claude-multi` does exactly that — one harness, one workflow, multiple providers.

And since it is still Claude Code underneath, you keep everything: `/loop`, `/goal`, skills, MCP servers, plugins. Switching providers does not mean leaving your workflow behind.

```bash
claude          # your normal Claude Code setup
claude-glm      # Claude Code using GLM / Z.ai config
claude-deepseek # Claude Code using DeepSeek config
claude-minimax  # Claude Code using MiniMax config
```

Each instance is isolated, but still runs the normal unmodified Claude Code binary.

---

## Features

* **Multiple Claude Code instances** — create `claude-<name>` commands for different workflows.
* **Provider templates** — quickly configure GLM/Z.ai, MiniMax, or DeepSeek.
* **Isolated config directories** — each instance gets its own `~/.claude-<name>/` folder.
* **Interactive TUI** — a full terminal UI for everything: adding, listing, plugins, MCP, sync.
* **Plugin management** — enable, disable, copy, install, and remove plugins per instance.
* **MCP management** — list and copy MCP server configs between instances.
* **Auto-sync** — optionally symlink plugins and skills from your default `~/.claude` setup.
* **No Claude Code fork** — it wraps your existing `claude` binary instead of patching it.

---

## Requirements

* Node.js 18+ or Bun 1+
* Claude Code installed globally

Install Claude Code first if you have not already:

```bash
npm install -g @anthropic-ai/claude-code
```

---

## Install

Using Bun:

```bash
bun add -g claude-multi
```

Using npm:

```bash
npm install -g claude-multi
```

Using pnpm:

```bash
pnpm add -g claude-multi
```

Using Deno:

```bash
deno install -g -A -n claude-multi npm:claude-multi
```

---

## Getting started

Launch the TUI:

```bash
claude-multi
```

That is the only command you need to remember. Everything else happens inside the terminal UI.

### The main menu

When the TUI opens, you see a menu like this:

```
🤖 Claude Multi — Interactive Mode

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

Use arrow keys to navigate, `Enter` to select, `ESC` to go back, and `q` to quit.

### Setting up your first instance (step by step)

Pick **➕ Add new instance** from the menu. The wizard walks you through eight steps:

**1. Instance name**

Type a short name like `glm`, `deepseek`, or `work`. Only letters, numbers, hyphens, and underscores. This becomes your command — `claude-glm`, `claude-deepseek`, etc.

**2. Provider template**

Pick from the available providers:

* `glm` — GLM / Z.ai
* `minimax` — MiniMax
* `deepseek` — DeepSeek
* `None / Custom` — skip the template and configure manually later

**3. API key** *(only if you picked a provider)*

Paste your provider API key. It is masked as you type and written into the instance's `settings.json`.

**4. Confirm paths**

The wizard shows the default locations:

* Config: `~/.claude-<name>/`
* Binary: `~/.local/bin/claude-<name>`

Press `y` to accept (recommended).

**5. Copy options**

If you already have a `~/.claude` setup, you can carry pieces of it into the new instance:

* **Nothing — start fresh** — empty instance, no settings inherited
* **Only `settings.json`** — copy the base settings file
* **Select plugins to install** — pick specific plugins from your default setup
* **All files** — copy settings, `CLAUDE.md`, plugins, skills, the lot

**6. Select plugins** *(only if you picked "Select plugins")*

A multi-select list of every plugin available in your default `~/.claude`. Use `space` to toggle, `enter` to confirm.

**7. Auto-sync** *(only if you picked "All files")*

Choose whether to symlink `plugins/` and `skills/` back to your default `~/.claude`, so installing a plugin once makes it available everywhere. Pick `y` for shared, `n` for fully independent copies.

**8. Done**

The wizard confirms the new instance and shows its paths:

```
✓ Instance 'glm' created successfully!
  ├─ Binary: /Users/you/.local/bin/claude-glm
  └─ Config: /Users/you/.claude-glm
```

Now run it:

```bash
claude-glm
```

That's it — a full Claude Code session running on the provider you picked, with its own isolated config.

### Other TUI flows

* **📋 List all instances** — see every instance with its provider, paths, and sync status.
* **ℹ️ Instance details** — pick an instance to inspect its full configuration.
* **🔌 Manage plugins** — pick an instance, then enable, disable, install, copy, or remove plugins for it.
* **🔄 Toggle auto-sync** — flip symlink syncing on or off for a chosen instance.
* **🔗 Re-sync symlinks** — repair broken plugin or skill symlinks after moving `~/.claude` around.
* **🗑️ Remove instance** — delete an instance, its wrapper, and (optionally) its config dir.
* **⚙️ MCP servers** — view MCP configs and copy them between instances.

If the menu shows a `!` health hint, press `!` to view detected issues and fix them.

---

## Providers

| Provider | Endpoint | Template name |
|---|---|---|
| GLM (智谱AI) | `api.z.ai` | `glm` |
| MiniMax | `api.minimax.io` | `minimax` |
| DeepSeek | `api.deepseek.com` | `deepseek` |

Templates write `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, and related env vars to `~/.claude-<name>/settings.json`. You can edit that file directly to customize further.

---

## How it works

Each instance gets a config dir at `~/.claude-<name>/` and a wrapper script at `~/.local/bin/claude-<name>`. The wrapper sets `CLAUDE_CONFIG_DIR` before launching the unmodified `claude` binary — no forking, no patching.

```js
#!/usr/bin/env bun
process.env.CLAUDE_CONFIG_DIR = "/Users/you/.claude-glm"
spawn("claude", process.argv.slice(2), { stdio: "inherit", env: process.env })
```

Instance metadata lives in `~/.claude-multi/config.json`. With auto-sync on, `plugins/` and `skills/` are symlinked from `~/.claude/`, so installing a plugin once makes it available everywhere.

---

## File locations

| Path | Purpose |
|---|---|
| `~/.claude-multi/config.json` | claude-multi instance registry |
| `~/.claude-<name>/` | config directory for one instance |
| `~/.local/bin/claude-<name>` | generated wrapper command on Linux/macOS |
| `~/.claude/` | your default Claude Code config, treated as the source for copy/sync operations |

---

## Auto-sync vs manual mode

When auto-sync is enabled, `plugins/` and `skills/` are symlinked from your default `~/.claude/` directory. Installing or updating a plugin once makes it available across every instance that opted in.

Pick manual mode in the wizard (answer `n` at the auto-sync step) when you want an instance with fully independent plugin and skill files. You can also flip this later via **🔄 Toggle auto-sync** in the main menu.

---

## Troubleshooting

### `claude-<name>` command not found

Make sure your global binary directory is in `PATH`.

For Linux/macOS:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

If you use Bash:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Broken plugin or skill symlinks

Open the TUI and pick **🔗 Re-sync symlinks**. Choose the affected instance (or all of them) and the wrapper will rebuild the symlinks.

### Health warnings in the menu

If the main menu shows a yellow or red banner, press `!` to open the health screen. It lists what's wrong (missing binary, broken symlinks, stale registry entries, etc.) and offers actions to fix each issue.

### Force the simpler prompts UI

If the Ink TUI does not render correctly on your terminal:

```bash
CLAUDE_MULTI_INK=false claude-multi
```

This falls back to a basic prompt-based UI with the same flows.

---

## Roadmap ideas

* More provider templates
* Better docs for provider-specific models
* Import/export instance profiles
* Safer API key management
* Preset workflows for coding, planning, review, and cheap exploration models

---

## License

MIT
