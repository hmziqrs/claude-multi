---
title: How it works
description: How claude-multi isolates Claude Code instances with config directories, environment variables, plugin symlinks, and wrapper scripts.
---

## The wrapper approach

claude-multi doesn't fork, patch, or modify Claude Code. Each instance is a shell script that does two things: set `CLAUDE_CONFIG_DIR`, then `exec` the real `claude` binary.

```sh
#!/bin/sh
export CLAUDE_CONFIG_DIR="/Users/you/.claude-deepseek"
exec claude "$@"
```

On Windows, the same thing in batch:

```batch
@echo off
set "CLAUDE_CONFIG_DIR=%USERPROFILE%\.claude-multi\deepseek"
"C:\path\to\claude.exe" %*
```

That is the entire mechanism. Claude Code reads its config from the directory you point it at instead of `~/.claude`. Everything else behaves normally: flags, commands, keybindings, plugins, and MCP servers.

## File layout

```
~/.claude-multi/
├── config.json              # instance registry
├── health-status.json       # persistent health issue tracking
└── backups/                 # migration backups (auto-rotated, last 3 kept)

~/.claude-deepseek/          # one instance
├── settings.json            # provider env vars + merged settings
├── .claude.json             # instance state (onboarding, migration version)
├── plugins/                 # symlinked or copied plugins
├── skills/                  # symlinked or copied skills
└── projects/                # conversation history per project

~/.local/bin/
└── claude-deepseek          # wrapper script
```

| Path | Purpose |
|------|---------|
| `~/.claude-multi/config.json` | Central registry of all instances, name, paths, creation date, auto-sync status |
| `~/.claude-<name>/` | Per-instance config directory. Mirrors Claude Code's `~/.claude` structure |
| `~/.local/bin/claude-<name>` | Generated wrapper command (`.cmd` on Windows) |
| `~/.claude/` | Your default Claude Code config. Treated as the source for copy and sync operations. Never modified. |

## Instance isolation

Each instance is independent. It has its own `settings.json` holding provider env vars, enabled plugins, and MCP servers. It has its own `.claude.json` holding onboarding state, migration version, and user ID. Its `plugins/` and `skills/` directories are either symlinked back to `~/.claude` under auto-sync or kept as separate copies. Its `projects/` directory holds a conversation history that no other instance can see.

Two instances can run at the same time in different terminals. They share no state, take no lock files, and bind no ports.

## Auto-sync via symlinks

Sync has three modes (auto / half-manual / full-manual). In `auto` mode, an instance's `plugins/` and `skills/` are symlinked to `~/.claude/`, so a change there is immediately visible to every synced instance. The other modes trade that immediacy for per-instance control. See [Sync modes](/docs/usage/#sync-modes) for the full comparison and [Plugins & MCP](/docs/plugins-mcp/) for the operational detail, including `claude-multi fix-symlinks` for broken links.

## Provider templates

A provider template is a bundle of environment variables (base URL, model mappings, and default settings) that claude-multi merges into an instance's `settings.json` when it creates the instance. You supply the API key and the template handles the rest.

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash"
  }
}
```

Templates are plain config. They install nothing and make no network calls, and the only thing they change about Claude Code is the endpoint it talks to.

## Updating existing templates

Creating an instance copies the current provider template into its `settings.json`. claude-multi does not apply later template updates in the background. Run `claude-multi doctor check` after upgrading claude-multi, then `claude-multi doctor fix` to apply pending changes. The fix backs up the affected settings first.

The fix restores provider model slots and other template settings. It leaves your API keys and custom tuning values alone, except for known legacy defaults that have to change with the template.

See [Providers](/providers/) for the full template reference.

## Settings copy security

When copying settings from `~/.claude`, claude-multi transfers only these fields:

- `includeCoAuthoredBy`
- `alwaysThinkingEnabled`
- `enabledPlugins`

It never copies the `env` block, which holds your API keys. Each instance gets its own API key when you create it.

## Health monitoring

claude-multi runs health checks across all instances. It looks for:

- Missing config directories
- Missing wrapper binaries
- Corrupted `settings.json`
- Broken symlinks
- Failed config migrations

If it finds anything, the TUI shows a warning banner. Press `!` to open the health screen, which lists each problem and its suggested fix.

## Config migration

When the config format changes between versions, claude-multi migrates it for you:

1. Backs up `config.json` and affected `settings.json` files
2. Validates the current state
3. Transforms to the new format
4. Saves atomically (temp-file-rename pattern)

Migrations take a PID-based lock so two cannot run at once. A failed migration sets a `migrationStatus: "failed"` flag, and the health screen then offers retry or restore. claude-multi keeps the last 3 backups in `~/.claude-multi/backups/`.

## Runtime detection

The entry point (`bin/claude-multi.js`) is a polyglot file that is valid POSIX shell and valid ESM JavaScript at the same time. When you run it:

1. The shell portion checks for `bun`, then `node`, then `deno` in your PATH
2. Re-executes itself under the first runtime found
3. The JavaScript portion takes over

The generated wrapper scripts are plain shell scripts (or `.cmd` batch files on Windows) and need no JavaScript runtime at launch. They set `CLAUDE_CONFIG_DIR` and exec the `claude` binary.
