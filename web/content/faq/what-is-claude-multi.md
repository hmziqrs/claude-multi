---
question: "What is claude-multi and why should I use it?"
description: "claude-multi is an open-source CLI that runs multiple Claude Code instances side by side, each with its own AI provider, config directory, and history."
category: "Getting Started"
order: 1
---

claude-multi is a CLI that runs multiple Claude Code instances at the same time, each with its own AI provider configuration. By default, every instance gets its own config directory under `~/.claude-<name>/`, so settings, history, and MCP servers stay separate. Your normal `~/.claude` setup is left alone.

#### The problem it solves

Claude Code keeps settings, plugins, skills, and conversation history in one `~/.claude` folder. That works until you want to try a second provider or keep a work setup apart from a personal one. Then you copy files by hand, swap environment variables, and hope nothing gets overwritten.

claude-multi gives each instance its own alias (`claude-glm`, `claude-deepseek`, `claude-anthropic`), backed by a real directory you can browse and edit. The alias is a wrapper that sets `CLAUDE_CONFIG_DIR` and runs the official `claude` binary.

#### What it isn't

It doesn't fork or patch Claude Code. It doesn't run a proxy or daemon, and it doesn't route between models. Each instance is a standalone Claude Code environment. claude-multi manages the config directories and wrapper scripts.

#### What you get

- Templates for six providers: GLM, MiniMax, DeepSeek, Xiaomi MiMo, Kimi, and Qwen. There are eight templates because MiMo and Qwen each have two plan variants.
- Plugin auto-sync through `plugins/` and `skills/` symlinks. Update once, and every synced instance sees it.
- MCP server management across instances.
- Health checks for broken symlinks, missing directories, and corrupted config.
- A terminal UI built with Ink and React, plus a prompts fallback.

The [docs](/docs/) cover setup and the full command reference. For the wrapper mechanism, see [how it works](/docs/how-it-works/). Template definitions are in [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts); instance management is in [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts).
