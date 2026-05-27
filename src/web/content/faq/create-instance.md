---
question: "How do I create a new instance for a provider?"
description: "Use the interactive TUI or the CLI add command to spin up an isolated Claude Code instance with a provider template in two commands."
category: "Usage"
order: 4
---

There are two ways to create an instance: the **interactive TUI** or the **CLI command**.

## Interactive TUI

```sh
claude-multi
```

Select **Add new instance** from the main menu. The TUI walks you through an 8-step wizard:

1. **Name** — pick a short alias (e.g. `deepseek`, `glm`)
2. **Provider** — choose from the template list or skip for a manual setup
3. **API key** — paste your provider API key (input is masked)
4. **Copy settings** — optionally copy settings from your primary `~/.claude` install
5. **Copy plugins** — optionally bring over installed plugins
6. **Copy MCP servers** — optionally copy MCP server configs
7. **Auto-sync** — enable symlink-based plugin syncing from `~/.claude`
8. **Confirm** — review and create

## CLI command

```sh
claude-multi add deepseek --provider deepseek --api-key sk-your-key
```

Flags:

| Flag | Description |
|------|-------------|
| `--provider <name>` | Template to use (glm, minimax, deepseek, mimo, kimi, qwen, etc.) |
| `--api-key <key>` | API key for the provider |
| `--copy-settings` | Copy settings from `~/.claude` |
| `--copy-plugins` | Copy plugins from `~/.claude` |
| `--copy-mcp` | Copy MCP server configs from `~/.claude` |
| `--auto-sync` | Enable auto-sync for plugins and skills |

## What happens under the hood

When you create an instance, claude-multi:

1. Creates a directory at `~/.claude-multi/<name>/` with its own `settings.json` and `.claude.json`
2. Merges provider-specific env vars (base URL, model mappings) into the instance settings
3. Symlinks plugins and skills from `~/.claude` if auto-sync is enabled
4. Generates a wrapper script at `~/.local/bin/claude-<name>` that sets `CLAUDE_CONFIG_DIR` and execs the real `claude` binary

After creation, just run `claude-<name>` (e.g. `claude-deepseek`) to launch Claude Code with that provider.

## References

| Resource | Link |
|----------|------|
| **Blog: Every TUI menu** | [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/) — step-by-step walkthrough of the creation wizard |
| **Getting started docs** | [/docs/getting-started/](/docs/getting-started/) — first instance setup |
| **Usage docs** | [/docs/usage/](/docs/usage/) — full CLI command reference |
| **In-app: Add instance** | Run `claude-multi` and select **Add new instance** |
| **GitHub: AddInstance screen** | [src/ink/screens/AddInstance.tsx](https://github.com/hmziqrs/claude-multi/blob/master/src/ink/screens/AddInstance.tsx) — TUI implementation |
| **GitHub: Config** | [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts) — `addInstance()` function |
| **GitHub: Wrapper** | [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts) — wrapper script generation |
