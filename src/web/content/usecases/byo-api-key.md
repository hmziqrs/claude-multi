---
title: "Use Your Own API Key from Any Provider"
description: "Already paying for GLM, DeepSeek, or MiniMax directly? Plug your key into claude-multi and keep the Claude Code interface you know."
slug: "byo-api-key"
persona: "Developer with existing accounts"
painPoint: "You already have API keys and billing set up with providers like GLM, DeepSeek, or MiniMax. You want to use those accounts through Claude Code without switching tools or rewriting configs."
solution: "Use claude-multi's provider templates to wire your existing key into an isolated Claude Code instance. One setup, one command, done."
steps:
  - title: "Install claude-multi"
    code: "npm install -g claude-multi"
  - title: "Open the TUI and add an instance"
    code: "claude-multi\n# Pick: Add new instance"
  - title: "Choose your provider template"
    code: "# Pick one: glm, minimax, deepseek, mimo, kimi, qwen\n# The template sets the endpoint and model automatically"
  - title: "Paste your API key"
    code: "# Key is masked while typing\n# Stored in ~/.claude-<name>/settings.json"
  - title: "Run it"
    code: "claude-glm  # or claude-deepseek, claude-minimax, etc."
providers:
  - "GLM"
  - "DeepSeek"
  - "MiniMax"
order: 3
---

## Bring what you already have

If you are paying for API access to GLM, DeepSeek, MiniMax, or any OpenAI-compatible provider, you should not have to learn a new tool to use it. claude-multi takes the key you already have and wraps it in the Claude Code interface you already know.

## The setup

```bash
claude-multi
```

Pick **Add new instance**. The wizard walks you through:

1. **Name your instance** -- something short like `glm`, `deepseek`, `minimax`
2. **Pick a template** -- claude-multi sets the base URL, model name, and required env vars
3. **Paste your key** -- it is masked while you type and stored in the instance's own `settings.json`
4. **Confirm paths** -- config at `~/.claude-<name>/`, binary at `~/.local/bin/claude-<name>`
5. **Done** -- run `claude-glm` (or whatever you named it)

```bash
claude-glm "explain this concurrency bug"
```

That is a full Claude Code session, using your GLM key, with its own config directory.

## Available templates

| Template | Provider | What it sets |
|----------|----------|-------------|
| `glm` | GLM / Z.ai | `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL` |
| `minimax` | MiniMax | Endpoint and model for MiniMax |
| `deepseek` | DeepSeek | Endpoint and model for DeepSeek |
| `mimo` | Xiaomi MiMo | Xiaomi's coding endpoint |
| `kimi` | Moonshot Kimi | Moonshot's API |
| `qwen` | Alibaba Qwen | Alibaba's international endpoint |

## What happens with your key

The key gets written to `~/.claude-<name>/settings.json` as part of the `ANTHROPIC_AUTH_TOKEN` env var. claude-multi does not send it anywhere. It stays on your machine, in a file that only you (and the Claude Code process) can read.

```bash
# Check what is stored
claude-multi
# Pick: Instance details
# Select your instance to see the full config
```

## Multiple keys, multiple instances

You are not limited to one. Create an instance for each provider you have access to:

```bash
claude-glm      # your GLM account
claude-deepseek # your DeepSeek account
claude-minimax  # your MiniMax account
```

All of them run the same Claude Code binary. Same interface, same skills, different brain behind the curtain.
