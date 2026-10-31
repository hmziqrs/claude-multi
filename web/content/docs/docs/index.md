---
title: Documentation
description: "Install claude-multi, run Claude Code against GLM, MiniMax, DeepSeek, MiMo, Kimi, or Qwen, and keep each setup in its own config directory."
template: doc
---

## What claude-multi does

Claude Code reads its configuration from one directory, `~/.claude` by default. That directory holds your API credentials, model settings, plugins, skills, MCP servers, and conversation history. Point it at a different provider and all of it changes at once.

claude-multi gives each provider its own directory and its own command. A `claude-glm` session reads `~/.claude-glm/`. A `claude-deepseek` session reads `~/.claude-deepseek/`. Your normal `~/.claude` setup keeps working, with the same Claude Code binary and the plugins you already installed.

The CLI is `claude-multi` 0.13.x, MIT licensed, and runs no daemon. Each instance is a directory plus a small wrapper script that sets `CLAUDE_CONFIG_DIR` and execs the official `claude` binary. Nothing is forked or patched.

Instances share the Claude Code executable, not its state. Upgrading Claude Code updates every instance at once. Changing a model in one instance's `settings.json` changes only that instance.

## Providers and templates

Six providers ship as eight templates. `claude-multi add <name>` asks which template to use, then writes the base URL, model slots, and defaults into the new instance.

| Provider | Template | Models | Billing | Endpoint | Context | Best for |
|----------|----------|--------|---------|----------|---------|----------|
| GLM (Z.ai) | `glm` | `glm-5.3[1m]`, `glm-5.3-flash[1m]` | Coding Plan subscription | `https://api.z.ai/api/anthropic` | 1M, 128K cap | Predictable monthly budget, agentic coding |
| MiniMax | `minimax` | `MiniMax-M3.1-Flash[1m]` | Pay per token | `https://api.minimax.io/anthropic` | 1M, 128K cap | Large refactors that need a long window |
| DeepSeek | `deepseek` | `deepseek-flash[1m]` (V4.1 Flash), `deepseek-v4-pro` optional | Pay per token | `https://api.deepseek.com/anthropic` | 1M, 128K cap | Routine work at low per-token cost |
| Xiaomi MiMo | `mimo` | `mimo-v2.6-pro[1m]`, `mimo-v2.6-flash[1m]` | Pay per token | `https://api.xiaomimimo.com/anthropic` | 1M, 128K cap | Cost-sensitive coding |
| Xiaomi MiMo Token Plan | `mimo-token` | `mimo-v2.6-pro[1m]`, `mimo-v2.6-flash[1m]` | Subscription credit pool | `https://token-plan-cn.xiaomimimo.com/anthropic` | 1M, 128K cap | Fixed monthly spend in China, Singapore, or Europe |
| Moonshot Kimi | `kimi` | `kimi-k3.1-pro[1m]` | Pay per token | `https://api.moonshot.ai/anthropic` | 1M, 128K cap | Tool-heavy agent work |
| Alibaba Qwen | `qwen` | `qwen3.8-max`, `qwen3.7-plus`, `qwen3.8-flash` | Pay per token | `https://dashscope-intl.aliyuncs.com/apps/anthropic` | 1M, 128K cap | General coding on DashScope |
| Alibaba Qwen Coding Plan | `qwen-coding` | `qwen3.7-plus` | Coding Plan subscription | `https://coding-intl.dashscope.aliyuncs.com/apps/anthropic` | 1M, 128K cap | Subscription coding on DashScope |

All eight templates match the current model lists. Qwen coverage differs by plan, not by endpoint. The `qwen` template maps Qwen3.8-Max, Qwen3.7-Plus, and Qwen3.8-Flash. The `qwen-coding` template uses Qwen3.7-Plus in every slot because the Coding Plan does not include Qwen3.8-Max or Qwen3.8-Flash.

Run `claude-multi doctor check` after upgrading claude-multi. It reports pending instance migrations, and `claude-multi doctor fix` refreshes model slots and known legacy defaults. Your API keys and values you changed yourself survive.

## What is isolated per instance

Isolation is per directory, not per process. Each instance has its own settings file, conversation history, and credentials. Two instances can run in different terminals at the same time. They share no lock files and bind no ports.

| Item | Where it lives | How it is isolated |
|------|----------------|--------------------|
| Settings | `~/.claude-<name>/settings.json` | Separate file holding provider env, `enabledPlugins`, and `mcpServers`. |
| History | `~/.claude-<name>/projects/` | Separate transcripts for each project. No other instance reads them. |
| Plugins | `~/.claude-<name>/plugins/` | A directory symlink in `auto` mode, per-item symlinks in `half-manual`, or a real copy in `full-manual`. |
| Skills | `~/.claude-<name>/skills/` | Same sync rules as plugins. |
| MCP servers | `mcpServers` in the instance's `settings.json` | Entries in the settings file. They are not symlinked, even when plugins are. |
| Credentials | `ANTHROPIC_AUTH_TOKEN` in the instance's `settings.json` | Each instance stores its own key. `--copy-settings` never copies the `env` block; `--copy-all` copies the settings file, and a provider template then merges over it. |
| Registry | `~/.claude-multi/config.json` | Shared index of names and paths. It holds no API keys. |

Plugins can ship their own MCP servers in a `.mcp.json` file. Those arrive with the plugin directory, so a symlinked plugin can expose a server in every synced instance. Servers you add yourself live only in that instance's `settings.json`.

## Quick start

1. Install the CLI. Claude Code must already be installed globally, and Node.js 18+, Bun 1+, or Deno 1+ must be available.

   ```bash
   npm install -g claude-multi
   ```

2. Create an instance. The TUI walks through the name, template, key, paths, copy options, and sync mode.

   ```bash
   claude-multi
   ```

   For a scripted create, pass the template and key explicitly:

   ```bash
   claude-multi add glm --provider glm --api-key your-zai-key --skip-prompts
   ```

   The shorter `claude-multi add glm` is interactive. It asks for the provider, key, paths, and copy options instead of taking them as flags.

3. Run the instance.

   ```bash
   claude-glm
   ```

`claude-multi list` shows the wrapper and config paths for every instance. If `claude-glm` is not found, the wrapper directory is not on `PATH`. See [Getting started](/docs/getting-started/) for per-runtime paths.

## When not to use this

Use a shell alias if you only need to swap an API key and an endpoint. Two exports in an alias are less machinery than a CLI, but the alias shares one config directory, so history, plugins, and settings are shared too. claude-multi is worth the extra layer when you want those separated.

Use a proxy or router if you already run one. A gateway such as LiteLLM maps model names to providers behind a single Anthropic-compatible endpoint. Point one Claude Code config at the gateway. Adding claude-multi on top gives you a second routing layer with nothing to isolate.

Keep your single-provider setup if you use one provider. Edit `~/.claude/settings.json` once and leave it alone. Instances earn their keep when you need separate keys, separate histories, or different plugin sets for different clients or projects.

## Where to go next

- [Getting started](/docs/getting-started/) covers installation, Windows paths, verification, and uninstall.
- [Usage](/docs/usage/) is the full command reference.
- [How it works](/docs/how-it-works/) explains the wrapper, file layout, and sync modes.
- [Plugins and MCP](/docs/plugins-mcp/) covers plugin installs and MCP server configuration.
- [Configuration](/docs/configuration/) documents the registry and settings files.
- [Environment variables](/docs/environment-variables/) lists every key the templates write.
- [Troubleshooting](/docs/troubleshooting/) covers PATH, auth, symlink, and migration failures.
- [Providers](/providers/) has the per-provider setup pages and model details.

Reviewed 2026-10-31

## Related

- [Getting started](/docs/getting-started/)
- [Usage](/docs/usage/)
- [Providers](/providers/)
- [Configuration](/docs/configuration/)
- [Troubleshooting](/docs/troubleshooting/)
