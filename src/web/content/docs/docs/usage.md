---
title: Usage
description: "Full CLI command reference for claude-multi: add, remove, list, sync, health-check, and TUI navigation for managing multi-provider Claude Code instances."
---

## Default action

Running `claude-multi` with no arguments launches the interactive terminal UI. Everything you can do from the CLI also lives inside the menu.

```bash
claude-multi
```

Use arrow keys to navigate, `Enter` to select, `ESC` to go back, `q` to quit. If the Ink-based TUI doesn't render on your terminal, force the simpler prompts UI:

```bash
CLAUDE_MULTI_INK=false claude-multi
```

## Instance management

### `add`, Create a new instance

```bash
claude-multi add <name> [options]
```

| Flag | Description |
|------|-------------|
| `--provider <name>` | Provider template to use (`glm`, `minimax`, `deepseek`, `mimo`, `mimo-token`, `kimi`, `qwen`, `qwen-coding`) |
| `--api-key <key>` | API key for the provider |
| `--config <path>` | Custom config directory (default: `~/.claude-<name>/`) |
| `--binary <path>` | Custom binary path (default: `~/.local/bin/claude-<name>`) |
| `--copy-settings` | Copy settings from `~/.claude` |
| `--copy-all` | Copy all files from `~/.claude` (settings, plugins, skills, CLAUDE.md) |
| `--copy-mcp` | Copy MCP server configs from `~/.claude` |
| `--skip-prompts` | Skip interactive prompts (use with `--provider` and `--api-key`) |
| `--sync-mode <mode>` | Set sync mode at creation: `auto`, `half-manual`, or `full-manual` |
| `--auto-sync` | Shortcut for `--sync-mode auto` |
| `--half-manual` | Shortcut for `--sync-mode half-manual` |
| `--manual` | Shortcut for `--sync-mode full-manual` |

**Examples:**

```bash
# Interactive, the TUI asks everything
claude-multi add deepseek

# Non-interactive, fully scripted
claude-multi add deepseek --provider deepseek --api-key sk-your-key --skip-prompts

# Copy everything from default setup with auto-sync
claude-multi add glm --provider glm --api-key your-key --copy-all --auto-sync
```

### `remove`, Remove an instance

```bash
claude-multi remove <name>
```

This removes the instance from the registry and deletes the wrapper script. It leaves the config directory on disk and prints a hint so you can delete it yourself.

| Flag | Description |
|------|-------------|
| `-f, --force` | Skip confirmation prompt |

### `list`, List all instances

```bash
claude-multi list
```

Shows every instance with its provider, paths, and sync status. Alias: `claude-multi ls`.

### `info`, Show instance details

```bash
claude-multi info <name>
```

Displays full configuration for a single instance: paths, settings, plugins, auto-sync status.

## Plugin management

All plugin commands use the `plugins` subcommand:

```bash
claude-multi plugins <action> [args]
```

| Action | Description |
|--------|-------------|
| `list` | List all available plugins across all instances |
| `enable <instance> <plugin-id>` | Enable a plugin for an instance |
| `disable <instance> <plugin-id>` | Disable a plugin for an instance |
| `install <instance> <ids...>` | Install plugins with collision detection |
| `remove <instance> <ids...>` | Remove plugins (guards against auto-sync conflicts) |
| `copy <source> <dest> <ids...>` | Copy plugins between instances |
| `list-defaults` | List all default plugins with category and MCP badges |
| `list-installed [instance]` | List installed plugins per instance |
| `check-collisions <instance> <ids...>` | Detect MCP server name conflicts |

## MCP server management

```bash
claude-multi mcp <action> [args]
```

| Action | Description |
|--------|-------------|
| `list` | List MCP server configs across all instances |
| `copy` | Copy MCP server configs between instances |
| `verify` | Check that referenced executables and paths still exist |

## Sync modes

Plugin and skill syncing has three modes. Set one at creation or change it later:

```bash
claude-multi add <name> --sync-mode half-manual
claude-multi auto-sync <name> <auto|half-manual|full-manual>
```

Legacy `on`/`off` still work with `auto-sync` (`on` maps to `auto`, `off` maps to `full-manual`).

| Mode | Behavior |
|------|----------|
| `auto` | `plugins/` and `skills/` are symlinked whole to `~/.claude/`. Any change there is instantly visible to the instance. |
| `half-manual` | Real directories, but each plugin and skill inside is individually symlinked back to `~/.claude/`. You keep the existing plugins, but new installs in `~/.claude` don't appear until you re-sync. |
| `full-manual` | Independent copies of everything. No symlinks. The instance can drift freely from `~/.claude`. |

Conversions are one-way: `auto` → `half-manual` → `full-manual`. You can't step back up, because reconciling directories that have diverged is a data-loss problem. The TUI Sync Mode screen shows the current mode (color-coded) and which downgrades are available, plus a **Force re-sync** option that rebuilds the symlinks without changing the mode. In half-manual mode, `plugin install` and `remove` are blocked, since individually symlinked plugins can't be individually managed.

If symlinks break (you moved or deleted `~/.claude`), repair them with `claude-multi fix-symlinks`.

## Symlink repair

Fix broken symlinks across instances:

```bash
claude-multi fix-symlinks [names...]
```

| Flag | Description |
|------|-------------|
| `-a, --all` | Fix all instances at once |

Without arguments, claude-multi asks which instances to repair.

## Provider template updates

Provider models and recommended settings change over time. Check existing instances after updating claude-multi:

```bash
claude-multi doctor check
claude-multi doctor fix
```

`doctor check` reports instances whose provider settings differ from the current template. `doctor fix` asks for confirmation, creates a backup, then updates model slots and other template settings. API keys and custom tunables stay unchanged unless a value is a documented legacy default that needs an upgrade.

The TUI shows `Run instance migrations` when the same work is pending.

## Version and updates

```bash
# Check Claude Code version and whether an update is available
claude-multi version

# Update Claude Code to the latest version
claude-multi update
```

These commands manage the `@anthropic-ai/claude-code` package. To update claude-multi itself, use your package manager (`bun update -g claude-multi`, `npm update -g claude-multi`, etc.).

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_MULTI_INK` | `true` | Set to `false` to use the simpler prompts-based UI instead of Ink |
| `CLAUDE_MULTI_HOME` | `~` | Override the base directory for config (useful for testing) |
| `CLAUDE_MULTI_UPDATE_CHECK` | `false` | Set to `true` to check for updates on launch |

See [Environment Variables](/docs/environment-variables/) for the full reference including provider env vars.

## Common workflows

### Switch providers on the fly

Each instance is an independent command, so switching means running a different one. You do not edit config or export environment variables.

```bash
claude-glm "explain this function"
claude-deepseek "write tests for auth.ts"
```

Both are full, simultaneous Claude Code sessions. Open two terminals and they don't interfere with each other.

### Route by cost

Most day-to-day work like renaming variables or updating docs does not need a frontier model. Keep a cheap instance for routine tasks and a stronger one for the hard problems:

```bash
claude-multi add budget --provider deepseek --api-key sk-...
claude-multi add power --provider glm --api-key your-key

claude-budget "add error handling to all fetch calls"   # routine
claude-power "redesign the auth module to support SAML" # needs judgment
```

Enable auto-sync on both so they still share the same plugins and MCP servers.

### Benchmark providers on your codebase

Marketing pages claim every model is the best. Test against your own code instead. Create one instance per provider, run the same prompt through each, and compare the results.

```bash
claude-multi add test-glm --provider glm --api-key ...
claude-multi add test-deepseek --provider deepseek --api-key ...

claude-test-glm -p "find the memory leak in src/cache.ts"
claude-test-deepseek -p "find the memory leak in src/cache.ts"
```

Remove the test instances once you have picked a winner, or keep them for a periodic re-check.

### Separate work and personal instances

Mixing contexts in one config leaks your work API key into personal sessions and tangles the conversation history. Give each context its own instance:

```bash
claude-multi add work --provider glm --api-key work-key
claude-multi add personal --provider deepseek --api-key personal-key
```

Leave auto-sync off between them. Sharing plugins would defeat the point of isolating them.

### Standardize a team setup

Create one reference instance with your team's provider, plugins, MCP servers, and `CLAUDE.md`, then have each new hire recreate it with the copy-all option:

```bash
claude-multi add team --provider your-provider --copy-all
```

Store the config (minus API keys) in your dotfiles repo so onboarding is `git clone` plus one command.
