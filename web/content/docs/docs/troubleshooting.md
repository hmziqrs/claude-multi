---
title: Troubleshooting
description: "Fix common claude-multi issues: command not found, auth errors, broken plugin symlinks, MCP servers that will not load, and failed migrations."
---

## `claude-<name>` command not found

Your global binary directory is not on `PATH`, or the wrapper is missing.

The wrapper directory depends on the platform and, on Windows, the package manager:

| Platform | Wrapper directory |
|----------|-------------------|
| macOS and Linux | `~/.local/bin/` |
| Windows with npm or pnpm | `%APPDATA%\npm` |
| Windows with Bun | `%USERPROFILE%\.bun\bin` |
| Windows with Deno | `%USERPROFILE%\.deno\bin` |

A custom `--binary` path overrides these defaults.

Add the directory printed by `claude-multi list` to your `PATH`. For a quick test in the current shell:

```bash
# macOS and Linux
export PATH="$HOME/.local/bin:$PATH"
```

```powershell
# Windows, npm or pnpm
$env:Path = "$env:APPDATA\npm;$env:Path"
```

For persistent setup on zsh, bash, and PowerShell, see [Getting started](/docs/getting-started/). `claude-multi add` also prints a warning when the wrapper directory is not on `PATH`.

If the directory is already on `PATH` but the command still fails, check whether the wrapper exists and points at the right binary:

```bash
claude-multi doctor check
claude-multi doctor fix
```

`doctor check` reports a missing wrapper or a wrapper that points at a different `claude` binary. `doctor fix` rewrites wrappers that exist but point at the wrong binary. It does not recreate a wrapper you deleted. In that case, remove the instance and create it again with the same name.

## Broken plugin or skill symlinks

If you moved or deleted `~/.claude/`, the symlinks in auto-synced and half-synced instances point at nothing.

From the TUI, select **Re-sync symlinks** and pick the broken instance or all instances.

From the CLI:

```bash
# Fix a specific instance
claude-multi fix-symlinks deepseek

# Fix all instances
claude-multi fix-symlinks --all
```

`fix-symlinks` rebuilds whole-directory links in `auto` mode and per-item links in `half-manual` mode. Full-manual instances have no symlinks to repair.

## Health warning banner

A yellow or red banner at the top of the main menu means claude-multi found problems. Press `!` to open the health screen. Select an issue to see its detail and suggested fix.

| Problem | Cause | Fix |
|---------|-------|-----|
| Config directory missing | Instance directory was deleted outside claude-multi | Remove the instance or recreate the directory |
| Binary not found | Wrapper script was deleted or its directory moved | Recreate the instance, then check `PATH` |
| Wrong Claude binary | Wrapper points at an old Claude Code install | Run `claude-multi doctor fix` |
| Corrupted `settings.json` | Invalid JSON in the file | Fix the JSON or restore a copy from `~/.claude-multi/backups/` if one exists |
| Broken symlinks | Plugin or skill links point at missing targets | Run `fix-symlinks` |
| Migration failed | A config schema migration was interrupted | Restore the newest backup and retry |
| Instance migration pending | Instance settings are behind the current version | Run `claude-multi doctor fix` |

## Ink TUI doesn't render properly

Some terminals, including older SSH clients, do not handle the Ink-based React TUI well.

Force the simpler prompts-based UI:

```bash
CLAUDE_MULTI_INK=false claude-multi
```

The flows are the same. Only the rendering changes.

## API key not working

If Claude Code cannot authenticate with your provider:

1. Check the instance fields with `claude-multi info <name>`. The provider and region should match the account you are using.
2. Check the base URL. MiMo and Qwen have separate templates for pay-per-token and subscription plans, and the wrong template points at the wrong endpoint.
3. Read the instance's `env` block directly:

```bash
cat ~/.claude-deepseek/settings.json
```

The file path is `~/.claude-<name>/settings.json`, not `~/.claude-multi/<name>/settings.json`.

If the key is stored under `ANTHROPIC_AUTH_TOKEN` and the endpoint matches your plan, test the key with the provider's own API before changing claude-multi. A 401 from the provider means the key or account is the problem, not the wrapper.

## Wrong provider endpoint

Some providers use different base URLs for pay-per-token and subscription plans:

| Provider | Pay-per-token | Subscription |
|----------|--------------|--------------|
| Xiaomi MiMo | `mimo` template, `api.xiaomimimo.com` | `mimo-token` template, `token-plan-<region>.xiaomimimo.com` |
| Alibaba Qwen | `qwen` template, `dashscope-intl.aliyuncs.com` | `qwen-coding` template, `coding-intl.dashscope.aliyuncs.com` |
| GLM (Z.ai) | No Anthropic-compatible pay-per-token URL | `glm` template, `api.z.ai/api/anthropic` |

If you are on a subscription plan but used the pay-per-token template, or the other way around, the API key will not authenticate. Remove the instance and recreate it with the correct template.

For `mimo-token`, also check the region. `cn`, `sgp`, and `ams` use different hostnames, so create the instance with the region your subscription was issued for.

## Duplicate instance name

```
Error: Instance 'deepseek' already exists
```

Instance names must be unique. Pick a different name or remove the existing one first:

```bash
claude-multi remove deepseek
claude-multi add deepseek --provider deepseek --api-key sk-...
```

`remove` leaves the old config directory in place. If you recreate the instance with the same name, it reuses `~/.claude-deepseek/`, so delete that directory first if you want a clean start.

## MCP server not working

If an MCP server fails to connect:

1. Check the config shape with `claude-multi mcp verify <instance>`. A stdio entry needs a `command`; an HTTP or SSE entry needs a `url`.
2. Check for name collisions with `claude-multi plugins check-collisions <instance> <plugin-id>`.
3. Open `~/.claude-<name>/settings.json` and inspect the `mcpServers` field.
4. Start the instance and run `/mcp` to see whether the server connected and which tools it exposes.

`mcp verify` reads the config only. It does not start the server or test the port. If the command path is wrong or the server crashes on startup, `/mcp` and the server's own logs are the places to look.

## Config migration failed

If a config schema migration was interrupted:

1. Check `migrationMeta.migrationStatus` in `~/.claude-multi/config.json`. A failed migration also records `failureInfo` with the failed step and error.
2. Look in `~/.claude-multi/backups/`. Each backup is a timestamped directory containing `config.json` and the instance `settings.json` files.
3. Restore the newest backup over the current files if the config is unusable, then run `claude-multi doctor check`. Loading the restored config retries the migration.
4. Press `!` in the TUI to open the health screen and read the failure detail. Press `r` there to re-run the health checks.

claude-multi keeps the newest three backup directories. A migration takes a PID lock, so a stale lock older than 30 minutes is removed automatically.

## Provider template did not update

After upgrading claude-multi, run:

```bash
claude-multi doctor check
claude-multi doctor fix
```

`doctor check` reports instances created by an older version and provider settings that differ from the current template. `doctor fix` rewrites stale wrappers, then asks whether to run the pending instance migrations. A migration backs up the config and settings before it changes anything. It leaves your API keys and custom tuning values alone, except for documented legacy defaults.

If both commands report nothing, the template itself has not changed in that release. Check the provider pages for manual model overrides when a vendor retires a model before claude-multi ships a template update.

## Update check not working

Update checks are opt-in. Enable them:

```bash
export CLAUDE_MULTI_UPDATE_CHECK=true
claude-multi
```

Or check Claude Code manually:

```bash
claude-multi version
```

To check the claude-multi version, run `claude-multi --version`.

## Get help

- Run `claude-multi list` to see every instance, its paths, and its sync mode
- Run `claude-multi info <name>` for one instance
- Run `claude-multi doctor check` for a health report with suggested fixes
- Check the [GitHub issues](https://github.com/hmziqrs/claude-multi/issues) for known problems
- Open a new issue with your `claude-multi --version` output and the contents of `~/.claude-multi/config.json`

Reviewed 2026-10-31

## Related

- [Getting started](/docs/getting-started/)
- [Usage](/docs/usage/)
- [Configuration](/docs/configuration/)
- [Environment variables](/docs/environment-variables/)
