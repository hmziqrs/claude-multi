---
title: Troubleshooting
description: "Fix common claude-multi issues: instance not starting, provider connection errors, plugin sync failures, config directory problems, and wrapper script troubleshooting."
---

## `claude-<name>` command not found

Your global binary directory isn't on `PATH`. The exact location depends on your package manager, the TUI shows it when an instance is created.

**Common locations:**

| Runtime | Binary directory |
|---------|-----------------|
| Bun | `~/.bun/bin/` |
| npm (Linux/macOS) | `~/.local/bin/` or `/usr/local/bin/` |
| pnpm | `~/.local/share/pnpm/` |
| Deno | `~/.deno/bin/` |

**Fix:**

```bash
# zsh (macOS default)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Replace `~/.local/bin` with the actual path from your instance creation output.

---

## Broken plugin or skill symlinks

If you moved or deleted `~/.claude/`, symlinks in auto-synced instances point to nothing.

**Fix from TUI:** Select **Re-sync symlinks** from the main menu. Pick the broken instance (or all).

**Fix from CLI:**

```bash
# Fix a specific instance
claude-multi fix-symlinks deepseek

# Fix all instances
claude-multi fix-symlinks --all
```

---

## Health warning banner in the TUI

A yellow or red banner at the top of the main menu means claude-multi detected problems. Press `!` to open the health screen.

**Common health issues:**

| Problem | Cause | Fix |
|---------|-------|-----|
| Config directory missing | Instance dir was deleted outside claude-multi | Remove the instance or recreate the directory |
| Binary not found | Wrapper script was deleted | Re-create the instance |
| Corrupted settings.json | Invalid JSON in the config file | Fix or delete the corrupted file, then recreate |
| Broken symlinks | Plugin/skill links point to missing targets | Run `fix-symlinks` |
| Migration failed | Config schema migration was interrupted | Health screen offers retry/restore from backup |

---

## Ink TUI doesn't render properly

Some terminals (older SSH clients, certain terminal emulators) don't handle the Ink-based React TUI well.

**Fix:** Force the simpler prompts-based UI:

```bash
CLAUDE_MULTI_INK=false claude-multi
```

Same flows, simpler rendering.

---

## API key not working

If Claude Code can't authenticate with your provider:

1. **Check the key is set:** `claude-multi info <name>` shows the instance's settings
2. **Check the base URL:** Make sure you used the right provider template for your account type. Some providers (MiMo, Qwen) have separate templates for pay-per-token vs. subscription plans, using the wrong one means the wrong endpoint
3. **Verify the settings file:** Open `~/.claude-<name>/settings.json` and check the `env` block

```bash
# Check what's configured
cat ~/.claude-multi/deepseek/settings.json | jq .env
```

---

## Wrong provider endpoint

Some providers use different base URLs for pay-per-token vs. subscription plans:

| Provider | Pay-per-token | Subscription |
|----------|--------------|--------------|
| Xiaomi MiMo | `mimo` template | `mimo-token` template (different domain) |
| Alibaba Qwen | `qwen` template | `qwen-coding` template (different subdomain) |
| GLM (Z.ai) | No Anthropic-compatible URL | `glm` template (coding plan only) |

If you're on a subscription plan but used the pay-per-token template (or vice versa), your API key won't authenticate. Remove the instance and recreate with the correct template.

---

## Duplicate instance name

```
Error: Instance 'deepseek' already exists
```

Instance names must be unique. Either pick a different name or remove the existing one first:

```bash
claude-multi remove deepseek
claude-multi add deepseek --provider deepseek --api-key sk-...
```

---

## MCP server not working

If an MCP server fails to connect:

1. **Verify the config:** `claude-multi mcp verify` checks that referenced executables and paths exist
2. **Check for collisions:** `claude-multi plugins check-collisions <instance> <plugin-id>`, two plugins might register the same MCP server name
3. **Inspect the config:** Open `~/.claude-<name>/settings.json` and look at the `mcpServers` field

---

## Config migration failed

If a migration was interrupted:

1. Check `~/.claude-multi/config.json` for `migrationStatus` flags
2. Look for `.bak` files in the instance directory
3. The health screen (press `!` in the TUI) shows the specific error and offers retry or restore options

Migrations create backups before touching anything. The last 3 backup sets are kept in `~/.claude-multi/backups/`.

---

## Provider template did not update

After upgrading claude-multi, run:

```bash
claude-multi doctor check
claude-multi doctor fix
```

The check reports provider settings that no longer match the current template. The fix creates a backup and updates model slots and template settings. It keeps API keys and custom tuning values.

---

## Update check not working

Update checks are opt-in. Enable them:

```bash
export CLAUDE_MULTI_UPDATE_CHECK=true
claude-multi
```

Or check manually:

```bash
claude-multi version
```

---

## Still stuck?

- Run `claude-multi list` to see all instances and their status
- Run `claude-multi info <name>` for detailed config of a specific instance
- Check the [GitHub issues](https://github.com/hmziqrs/claude-multi/issues) for known problems
- Open a new issue with your `claude-multi version` output and the content of `~/.claude-multi/config.json`
