---
title: Usage
description: Full CLI command reference
---

## Default action

Running `claude-multi` with no arguments launches the interactive TUI (terminal UI). Everything you can do from the CLI also lives inside the menu.

```bash
claude-multi
```

Use arrow keys to navigate, `Enter` to select, `ESC` to go back, `q` to quit. If the Ink-based TUI doesn't render on your terminal, force the simpler prompts UI:

```bash
CLAUDE_MULTI_INK=false claude-multi
```

## Instance management

### `add` — Create a new instance

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
| `--auto-sync` | Enable auto-sync (symlink plugins/skills from `~/.claude`) |
| `--manual` | Disable auto-sync |

**Examples:**

```bash
# Interactive — the TUI asks everything
claude-multi add deepseek

# Non-interactive — fully scripted
claude-multi add deepseek --provider deepseek --api-key sk-your-key --skip-prompts

# Copy everything from default setup with auto-sync
claude-multi add glm --provider glm --api-key your-key --copy-all --auto-sync
```

### `remove` — Remove an instance

```bash
claude-multi remove <name>
```

Removes the instance from the registry and deletes the wrapper script. The config directory is kept on disk — you'll see a hint to delete it manually if you want.

| Flag | Description |
|------|-------------|
| `-f, --force` | Skip confirmation prompt |

### `list` — List all instances

```bash
claude-multi list
```

Shows every instance with its provider, paths, and sync status. Alias: `claude-multi ls`.

### `info` — Show instance details

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

## Auto-sync

Toggle symlink-based plugin/skill syncing for an instance:

```bash
claude-multi auto-sync <name> <on|off>
```

When enabled, `plugins/` and `skills/` in the instance directory are symlinks pointing back to `~/.claude/`. Install or update a plugin once and every synced instance picks it up.

## Symlink repair

Fix broken symlinks across instances:

```bash
claude-multi fix-symlinks [names...]
```

| Flag | Description |
|------|-------------|
| `-a, --all` | Fix all instances at once |

Without arguments, you'll be prompted to pick which instances to repair.

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
