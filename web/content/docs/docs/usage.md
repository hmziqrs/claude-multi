---
title: Usage
description: "CLI command reference for claude-multi 0.13.2: add, remove, list, sync, doctor, plugins, and MCP commands."
---

## Default action

Running `claude-multi` with no arguments launches the interactive terminal UI. Most CLI actions also live in the menu.

```bash
claude-multi
```

Use arrow keys to navigate, `Enter` to select, `ESC` to go back, `q` to quit. If the Ink-based TUI doesn't render on your terminal, force the simpler prompts UI:

```bash
CLAUDE_MULTI_INK=false claude-multi
```

## Instance management

### `add`

```bash
claude-multi add <name> [options]
```

| Flag | Description |
|------|-------------|
| `--provider <name>` | Provider template: `glm`, `minimax`, `deepseek`, `mimo`, `mimo-token`, `kimi`, `qwen`, `qwen-coding` |
| `--api-key <key>` | API key for the provider. Required when `--provider` is used |
| `--region <region>` | Region for `mimo-token`: `cn`, `sgp`, or `ams`. Defaults to `cn` with a warning |
| `-c, --config <path>` | Custom config directory (default: `~/.claude-<name>/`) |
| `-b, --binary <path>` | Custom wrapper path (default: `~/.local/bin/claude-<name>` on macOS and Linux, package manager bin on Windows) |
| `--copy-settings` | Copy `includeCoAuthoredBy`, `alwaysThinkingEnabled`, and `enabledPlugins` from `~/.claude` |
| `--copy-all` | Copy the default config directory, including `settings.json`, `CLAUDE.md`, and plugins. History and session state are excluded |
| `--copy-mcp` | Copy MCP server configs from `~/.claude` |
| `--skip-prompts` | Skip interactive prompts and start fresh |
| `--sync-mode <mode>` | Set sync mode at creation: `auto`, `half-manual`, or `full-manual` |
| `--auto-sync` | Shortcut for `--sync-mode auto` |
| `--half-manual` | Shortcut for `--sync-mode half-manual` |
| `--manual` | Shortcut for `--sync-mode full-manual` |

Use only one sync flag per command. Passing more than one exits with an error before anything is written. Sync flags apply to the scripted path. If you run `add` without `--provider`, `--skip-prompts`, or a copy flag, claude-multi opens the wizard. The wizard asks for the sync mode when you choose to copy plugins or all files.

**Examples:**

```bash
# Interactive: the TUI asks for provider, key, paths, and copy options
claude-multi add deepseek

# Non-interactive, fully scripted
claude-multi add deepseek --provider deepseek --api-key sk-your-key --skip-prompts

# MiMo Token Plan in Singapore
claude-multi add mimo-sg --provider mimo-token --api-key tp_your-key --region sgp --skip-prompts

# Start from your default setup, then apply the GLM template
claude-multi add glm --provider glm --api-key your-zai-key --copy-all --skip-prompts
```

`--provider` without `--api-key` is an error. The CLI does not fall back to a prompt in that form. Use `claude-multi add glm` with no flags if you want to be asked for the key.

`--copy-all` requires an existing `~/.claude` directory. If it is missing, the command removes the partially created instance and wrapper, then exits with an error.

### `remove`

```bash
claude-multi remove <name>
```

Alias: `claude-multi rm <name>`.

This removes the instance from the registry and deletes the wrapper script. It leaves the config directory on disk and prints the `rm -rf` command for it.

| Flag | Description |
|------|-------------|
| `-f, --force` | Skip the pre-removal summary |

### `list`

```bash
claude-multi list
```

Alias: `claude-multi ls`.

Shows every instance with its wrapper path, config path, creation date, provider and region, sync mode, and the claude-multi version it was created with.

### `info`

```bash
claude-multi info <name>
```

Displays the same fields for one instance without the surrounding list.

## Claude Code version and updates

```bash
# Check the installed Claude Code version and whether an update is available
claude-multi version

# Update @anthropic-ai/claude-code
claude-multi update
```

These commands manage the `@anthropic-ai/claude-code` package, not claude-multi. To update claude-multi itself, use your package manager (`npm update -g claude-multi`, `bun update -g claude-multi`, and so on). `claude-multi --version` prints the claude-multi version.

## Sync modes

Plugin and skill syncing has three modes. Set one at creation or change it later:

```bash
# At creation, in a scripted add
claude-multi add <name> --provider deepseek --api-key sk-... --sync-mode half-manual --skip-prompts

# Later
claude-multi auto-sync <name> <auto|half-manual|full-manual>
```

Legacy `on`/`off` still work with `auto-sync` (`on` maps to `auto`, `off` maps to `full-manual`).

| Mode | Behavior |
|------|----------|
| `auto` | `plugins/` and `skills/` are symlinked whole to `~/.claude/`. Any change there is instantly visible to the instance. |
| `half-manual` | Real directories, but each plugin and skill inside is individually symlinked back to `~/.claude/`. You keep the existing plugins, but new installs in `~/.claude` don't appear until you re-sync. |
| `full-manual` | Independent copies of everything. No symlinks. The instance can drift freely from `~/.claude`. |

Conversions are one-way: `auto` to `half-manual` to `full-manual`. claude-multi rejects upgrades because reconciling directories that have diverged is a data-loss problem. The TUI Sync Mode screen shows the current mode and which downgrades are available, plus a **Force re-sync** option that rebuilds symlinks without changing the mode.

In `auto` and `half-manual` modes, `plugins install` and `plugins remove` are blocked. Both operate on real files, and both modes use symlinks. Switch to `full-manual` first.

If symlinks break because you moved or deleted `~/.claude`, repair them with `claude-multi fix-symlinks`.

## Symlink repair

```bash
claude-multi fix-symlinks [names...]
```

| Flag | Description |
|------|-------------|
| `-a, --all` | Fix all instances at once |

Without names, claude-multi asks which instances to repair. The command rebuilds whole-directory symlinks in `auto` mode and per-item symlinks in `half-manual` mode. It reports full-manual instances as having no symlinks to repair.

## Doctor

```bash
claude-multi doctor check
claude-multi doctor fix
```

`doctor check` runs the health checks and prints each issue with a suggested fix. It reports missing config directories, missing wrappers, invalid `settings.json` files, broken symlinks, wrappers that point at a different `claude` binary, region URL mismatches, and pending instance migrations. Pending migrations include provider settings that differ from the current template.

`doctor fix` does two things. It rewrites wrappers that point at a stale Claude binary, then asks whether to run pending instance migrations. Migrations create a backup, refresh provider env from the current template, and record the migration version. API keys and custom tunable values survive, except for documented legacy defaults that the migration replaces.

The TUI shows **Run instance migrations** when the same work is pending.

## Plugin management

All plugin commands use the `plugins` subcommand:

```bash
claude-multi plugins <action> [args]
```

| Action | Description |
|--------|-------------|
| `list [instance]` | List enabled plugins. With no instance, shows the default setup and every instance |
| `enable <instance> <plugin-key>...` | Enable one or more plugins for an instance. Use the full `plugin-id@marketplace-name` key |
| `disable <instance> <plugin-key>...` | Disable one or more plugins |
| `install <instance> <plugin-id>...` | Copy plugins from `~/.claude` into the instance. Full-manual only |
| `remove <instance> <plugin-id>...` | Remove installed plugins. Full-manual only |
| `copy <instance>` | Copy the enabled plugin map from `~/.claude/settings.json` into one instance |
| `list-defaults` | List plugins available in `~/.claude`, with category and MCP badges |
| `list-installed [instance]` | List plugin files installed in one instance, or in every instance |
| `check-collisions <instance> <plugin-id>...` | Check whether the named plugins register MCP server names already in use |

`plugins copy` takes one instance name. It reads `enabledPlugins` from `~/.claude/settings.json` and writes that map into the instance's `settings.json`. It does not copy plugin files. Use `plugins install` for files, or `plugins copy` for the enable/disable list.

Claude Code stores plugin keys as `plugin-id@marketplace-name`. `enable` and `disable` take that full key, while `install` and `remove` take the bare plugin ID. Plugins from the official marketplace use `@claude-plugins-official`.

`plugins install` refuses to run while a Claude Code session is open on that instance. Close the session first.

`plugins remove` stages the plugin directory under a temporary `.removing` name, deletes it, and restores it if the delete fails.

## MCP server management

```bash
claude-multi mcp <action> [args]
```

| Action | Description |
|--------|-------------|
| `list [instance]` | List MCP server configs. With no instance, shows every instance |
| `copy` | Copy MCP server configs between instances, with prompts for source and target |
| `verify [instance]` | Check that each server entry has the fields its transport needs |

Run `claude-multi mcp copy` with no extra arguments and answer the prompts. The command replaces the target instance's `mcpServers` block with the source instance's block. It does not merge them.

`mcp verify` checks config shape, not whether a server process starts. It confirms that stdio entries have a `command` and that HTTP and SSE entries have a `url`. Use `/mcp` inside a session to check the live connection.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_MULTI_INK` | `true` | Set to `false` to use the simpler prompts-based UI instead of Ink |
| `CLAUDE_MULTI_HOME` | home directory | Base directory for central state such as migration backups and health status |
| `CLAUDE_MULTI_CLAUDE_PATH` | unset | Absolute path to the `claude` binary. Overrides the PATH lookup when wrappers are created or repaired |
| `CLAUDE_MULTI_UPDATE_CHECK` | `false` | Set to `true` to check for updates on launch |

See [Environment variables](/docs/environment-variables/) for the full reference, including the keys provider templates write into `settings.json`.

## Common workflows

### Switch providers on the fly

Each instance is an independent command, so switching means running a different one. You do not edit config or export environment variables.

```bash
claude-glm "explain this function"
claude-deepseek "write tests for auth.ts"
```

Both are simultaneous Claude Code sessions. Open two terminals and they don't interfere with each other.

### Route by cost

Most day-to-day work like renaming variables or updating docs does not need a frontier model. Keep a cheap instance for routine tasks and a stronger one for hard problems:

```bash
claude-multi add budget --provider deepseek --api-key sk-... --skip-prompts
claude-multi add power --provider glm --api-key your-key --skip-prompts

claude-budget "add error handling to all fetch calls"   # routine
claude-power "redesign the auth module to support SAML" # needs judgment
```

Auto-sync both if you want them to share plugins and skills with `~/.claude`. MCP servers stay per-instance in each `settings.json`; auto-sync does not copy them.

### Benchmark providers on your codebase

Marketing pages claim every model is the best. Test against your own code instead. Create one instance per provider, run the same prompt through each, and compare the results.

```bash
claude-multi add test-glm --provider glm --api-key ... --skip-prompts
claude-multi add test-deepseek --provider deepseek --api-key ... --skip-prompts

claude-test-glm -p "find the memory leak in src/cache.ts"
claude-test-deepseek -p "find the memory leak in src/cache.ts"
```

Remove the test instances once you have picked a winner, or keep them for a periodic re-check.

### Separate work and personal instances

Mixing contexts in one config leaks your work API key into personal sessions and tangles the conversation history. Give each context its own instance:

```bash
claude-multi add work --provider glm --api-key work-key --skip-prompts
claude-multi add personal --provider deepseek --api-key personal-key --skip-prompts
```

Set both to `full-manual` if you want separate plugins and skills too. Two `auto` instances still share `~/.claude/plugins` and `~/.claude/skills`.

```bash
claude-multi auto-sync work full-manual
claude-multi auto-sync personal full-manual
```

### Standardize a team setup

Create one reference instance with your team's provider, plugins, MCP servers, and `CLAUDE.md`, then have each new hire recreate it from their own `~/.claude`:

```bash
claude-multi add team --provider glm --api-key "$GLM_API_KEY" --copy-all --skip-prompts
```

`--copy-all` copies settings, `CLAUDE.md`, plugins, and skills from `~/.claude`. It also copies the default `settings.json`, including its `env` block. Review `~/.claude-team/settings.json` after creation and remove keys you do not want to carry over. The provider template replaces the provider env keys with the values for the key passed on the command line. Store the non-secret parts of the setup in your dotfiles repo and let each person supply their own key.

Reviewed 2026-11-03

## Related

- [Getting started](/docs/getting-started/)
- [Plugins and MCP](/docs/plugins-mcp/)
- [Configuration](/docs/configuration/)
- [Environment variables](/docs/environment-variables/)
- [Troubleshooting](/docs/troubleshooting/)
