---
title: Documentation
description: "Install the claude-multi CLI, configure providers, manage instances, and run multiple Claude Code sessions side by side with isolated configs."
template: doc
---

## What is claude-multi?

claude-multi is a free, open-source CLI that runs multiple Claude Code instances on the same machine. Each instance points at a different AI provider (GLM, MiniMax, DeepSeek, Xiaomi MiMo, Moonshot Kimi, Alibaba Qwen, or Anthropic) with its own config directory, API key, and model settings.

claude-multi runs no daemons and no background services. Every instance is a real directory you can inspect.

## Quick start

```bash
npm i -g claude-multi
claude-multi add glm --provider glm
claude-glm
```

That is it. `claude-glm` launches the official Claude Code binary with the GLM Coding Plan provider preconfigured.

## Key concepts

Provider templates carry the base URLs, model mappings, and defaults for each provider. You add your API key and the instance is ready.

Each provider gets its own config directory under `~/.claude-multi/`, so instances share no state and cannot conflict.

Plugin sync symlinks skills and MCP servers from your primary install. Update them once and every instance sees the change.

Each alias is a thin wrapper around the official `claude` binary, so every flag and keybinding works unchanged.

## Where to go next

- [Getting started](/docs/getting-started/) covers installation and your first instance.
- [Usage](/docs/usage/) is the full CLI command reference.
- [Providers](/providers/) lists every supported provider with model details.
- [How it works](/docs/how-it-works/) explains the architecture.
- [Configuration](/docs/configuration/) documents every config option.
- [Troubleshooting](/docs/troubleshooting/) covers common issues and fixes.
