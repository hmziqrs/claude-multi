---
title: How it works
description: How claude-multi isolates Claude Code instances with config directories, environment variables, plugin symlinks, and wrapper scripts.
---

## The wrapper approach

claude-multi doesn't fork, patch, or modify Claude Code. Each instance is a small script that does two things: set `CLAUDE_CONFIG_DIR`, then `exec` the real `claude` binary.

```sh
#!/bin/sh
export CLAUDE_CONFIG_DIR="/Users/you/.claude-deepseek"
exec "/Users/you/.local/bin/claude" "$@"
```

On Windows, the same thing in batch:

```batch
@echo off

set "CLAUDE_CONFIG_DIR=C:\Users\you\.claude-deepseek"
"C:\Users\you\AppData\Roaming\npm\claude.cmd" %*
```

That is the entire mechanism. Claude Code reads its config from the directory you point it at instead of `~/.claude`. Everything else behaves normally: flags, commands, keybindings, plugins, and MCP servers.

The wrapper records the resolved `claude` path at creation time. If you move or reinstall Claude Code, run `claude-multi doctor fix` to rewrite wrappers that still point at the old path.

## File layout

```
~/.claude-multi/
├── config.json              # instance registry
├── health-status.json       # persistent health issue tracking
├── backups/                 # migration backups (newest 3 kept)
└── .migration.lock          # PID-based migration lock

~/.claude-deepseek/          # one instance
├── settings.json            # provider env, enabled plugins, MCP servers
├── .claude.json             # Claude Code state (onboarding, user ID, migration version)
├── plugins/                 # symlinked, half-symlinked, or copied
├── skills/                  # symlinked, half-symlinked, or copied
└── projects/                # conversation history per project

~/.local/bin/
└── claude-deepseek          # wrapper script
```

| Path | Purpose |
|------|---------|
| `~/.claude-multi/config.json` | Central registry: instance names, config paths, wrapper paths, creation dates, sync modes, created-with versions, provider templates, and regions |
| `~/.claude-multi/health-status.json` | Health issues and their dismissed or resolved state |
| `~/.claude-multi/backups/` | Migration backups, up to three sets |
| `~/.claude-multi/.migration.lock` | PID-based lock so two migrations cannot run at once |
| `~/.claude-<name>/` | Per-instance config directory. Mirrors Claude Code's `~/.claude` structure |
| `~/.claude-<name>/settings.json` | Provider environment variables, `enabledPlugins`, and `mcpServers` |
| `~/.claude-<name>/.claude.json` | Onboarding state, user ID, and Claude Code migration version |
| `~/.claude-<name>/projects/` | Conversation history for that instance |
| `~/.local/bin/claude-<name>` | Generated wrapper on macOS and Linux |

On Windows, the wrapper is `claude-<name>.cmd` and lives in the package manager's global bin directory: `%APPDATA%\npm` for npm and pnpm, or `%USERPROFILE%\.bun\bin` for Bun.

## Instance isolation

Each instance is independent. It has its own `settings.json` holding provider env vars, enabled plugins, and MCP servers. It has its own `.claude.json` holding onboarding state, migration version, and user ID. Its `plugins/` and `skills/` directories are symlinked back to `~/.claude` in `auto` mode, per-item symlinked in `half-manual` mode, or kept as separate copies in `full-manual` mode. Its `projects/` directory holds a conversation history that no other instance can see.

Two instances can run at the same time in different terminals. They share no state, take no lock files, and bind no ports.

## Auto-sync via symlinks

Sync has three modes: `auto`, `half-manual`, and `full-manual`. In `auto` mode, an instance's `plugins/` and `skills/` are symlinked to `~/.claude/`, so a change there is immediately visible to every synced instance. The other modes trade that immediacy for per-instance control.

Only `plugins/` and `skills/` are symlinked. MCP servers are entries in each instance's `settings.json` and stay with that instance. A plugin can still carry its own MCP server in a `.mcp.json` file, and that server arrives with the plugin directory when the plugin is symlinked.

See [Sync modes](/docs/usage/#sync-modes) for the full comparison and [Plugins and MCP](/docs/plugins-mcp/) for the operational detail, including `claude-multi fix-symlinks` for broken links.

## Provider templates

A provider template is a bundle of environment variables (base URL, model slots, thinking settings, output limits) and a few Claude Code settings. claude-multi merges the template into an instance's `settings.json` when it creates the instance. You supply the API key.

This is what the `deepseek` template writes into `settings.json` in 0.13.x, with the key filled in:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "ANTHROPIC_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-flash",
    "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-flash",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "786432",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "128000",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_ALWAYS_ENABLE_EFFORT": "1",
    "MAX_THINKING_TOKENS": "32000"
  },
  "includeCoAuthoredBy": false
}
```

Templates are plain config. They install nothing and make no network calls. The only thing they change about Claude Code is the endpoint it talks to and the model names it sends.

Qwen coverage differs by plan. The pay-per-token `qwen` template maps Qwen3.8-Max, Qwen3.7-Plus, and Qwen3.8-Flash. The `qwen-coding` template uses Qwen3.7-Plus in every slot because the Coding Plan does not include Qwen3.8-Max or Qwen3.8-Flash. [Environment variables](/docs/environment-variables/) has the full mapping.

## Updating existing templates

Creating an instance copies the current provider template into its `settings.json`. claude-multi does not apply later template updates in the background.

After upgrading claude-multi, run:

```bash
claude-multi doctor check
claude-multi doctor fix
```

`doctor check` reports health issues, including pending instance migrations. Pending migrations cover instances created by an older claude-multi version and provider settings that differ from the current template. `doctor fix` rewrites wrappers that point at the wrong Claude binary, then asks whether to run the migrations. A migration backs up the affected `config.json` and `settings.json` files first.

The fix restores provider model slots and other template settings. It leaves your API keys and custom tuning values alone, except for known legacy defaults that have to change with the template.

See [Providers](/providers/) for the full template reference.

## Settings copy security

The two copy paths behave differently.

`--copy-settings` and the TUI's **Only settings.json** option transfer only three fields. The TUI's **Select plugins to install** option uses the same settings copy, then adds the plugins you pick:

- `includeCoAuthoredBy`
- `alwaysThinkingEnabled`
- `enabledPlugins`

They never copy the `env` block, which holds API keys.

`--copy-all` and the TUI's **All files** option copy `settings.json` as a file. That includes its `env` block. If you use `--copy-all` together with `--provider`, the provider template merges its own env over the copied values, but unrelated keys from the default file remain. Open `~/.claude-<name>/settings.json` and remove any key you do not want the instance to inherit.

## Health monitoring

claude-multi runs health checks across all instances. It looks for:

- Missing config directories
- Missing wrapper binaries
- Wrappers that point at a different `claude` binary
- Corrupted `settings.json`
- Broken symlinks
- Region URL mismatches on regional templates
- Failed or pending config migrations

If it finds anything, the TUI shows a warning banner. Press `!` to open the health screen, which lists each problem and its suggested fix.

## Config migration

When the config format changes between versions, claude-multi migrates it for you:

1. Creates a timestamped backup directory under `~/.claude-multi/backups/` containing `config.json` and each instance's `settings.json`
2. Validates the current state
3. Transforms to the new format
4. Saves atomically with a temp-file rename

Migrations take a PID-based lock so two cannot run at once. A failed migration sets `migrationMeta.migrationStatus` to `failed` and records the error. The health screen shows the failure detail. If the config is unusable, restore the newest backup directory. claude-multi keeps the newest three.

## The launcher

The `claude-multi` binary in `bin/claude-multi.js` is a short POSIX shell script, not JavaScript. It resolves symlinks, locates `build/cli.js`, and execs the first runtime it finds: Bun, then Node. If none is installed, it prints an error and exits.

The generated instance wrappers are separate. They are `/bin/sh` scripts on macOS and Linux and `.cmd` batch files on Windows. They need no JavaScript runtime at launch.

Reviewed 2026-10-31

## Related

- [Usage](/docs/usage/)
- [Plugins and MCP](/docs/plugins-mcp/)
- [Configuration](/docs/configuration/)
- [Environment variables](/docs/environment-variables/)
- [Troubleshooting](/docs/troubleshooting/)
