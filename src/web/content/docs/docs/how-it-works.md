---
title: How It Works
description: How claude-multi isolates Claude Code instances using config directories, environment variable injection, plugin symlinks, and wrapper scripts. Architecture overview.
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

That's the entire mechanism. Claude Code reads its config from the pointed-to directory instead of `~/.claude`. Everything else, flags, commands, keybindings, plugins, MCP, works exactly as it does normally.

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

Each instance is fully independent:

- **Own `settings.json`**, provider env vars, enabled plugins, MCP servers
- **Own `.claude.json`**, onboarding state, migration version, user ID
- **Own `plugins/` and `skills/`**, either symlinked (auto-sync) or independent copies
- **Own `projects/`**, conversation history, completely separate

Two instances can run at the same time in different terminals with no conflicts. No shared state, no lock files, no port conflicts.

## Auto-sync via symlinks

Sync has three modes (auto / half-manual / full-manual). In `auto` mode, an instance's `plugins/` and `skills/` are symlinked to `~/.claude/`, so a change there is immediately visible to every synced instance. The other modes trade that immediacy for per-instance control. See [Sync modes](/docs/usage/#sync-modes) for the full comparison and [Plugins & MCP](/docs/plugins-mcp/) for the operational detail, including `claude-multi fix-symlinks` for broken links.

## Provider templates

A provider template is a bundle of environment variables, base URL, model mappings, default settings, that gets merged into an instance's `settings.json` during creation. You supply the API key; the template handles the rest.

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

Templates are pure config, they don't install anything, make network calls, or change Claude Code's behavior beyond pointing it at a different endpoint.

## Updating existing templates

Creating an instance copies the current provider template into its `settings.json`. Later template updates are not applied in the background. Run `claude-multi doctor check` after upgrading claude-multi, then use `claude-multi doctor fix` to apply pending changes. claude-multi backs up the affected settings first.

The sync restores provider model slots and other template settings. It leaves API keys and custom tunables alone, except for known legacy defaults that must change with the provider template.

See [Providers](/providers/) for the full template reference.

## Settings copy security

When copying settings from `~/.claude`, only safe fields are transferred:

- `includeCoAuthoredBy`
- `alwaysThinkingEnabled`
- `enabledPlugins`

The `env` block (which contains API keys) is **never** copied. Each instance gets its own API key during creation.

## Health monitoring

claude-multi runs health checks across all instances and detects:

- Missing config directories
- Missing wrapper binaries
- Corrupted `settings.json`
- Broken symlinks
- Failed config migrations

When issues are found, the TUI shows a warning banner. Press `!` to see the health screen with each problem and its suggested fix.

## Config migration

When the config format changes between versions, claude-multi runs an automatic migration:

1. Backs up `config.json` and affected `settings.json` files
2. Validates the current state
3. Transforms to the new format
4. Saves atomically (temp-file-rename pattern)

Migrations use a PID-based lock to prevent concurrent runs. If a migration fails, it sets a `migrationStatus: "failed"` flag and the health screen offers retry or restore options. The last 3 backups are kept in `~/.claude-multi/backups/`.

## Runtime detection

The entry point (`bin/claude-multi.js`) is a polyglot file, simultaneously valid POSIX shell and ESM JavaScript. When executed:

1. The shell portion checks for `bun`, then `node`, then `deno` in your PATH
2. Re-executes itself under the first runtime found
3. The JavaScript portion takes over

Generated wrapper scripts are plain shell scripts (or `.cmd` batch files on Windows) that don't require a JavaScript runtime at launch, they just set `CLAUDE_CONFIG_DIR` and exec the `claude` binary.
