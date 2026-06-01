---
title: "GLM Coding Plan Provider for Claude Code"
description: "Run Claude Code with GLM-5.1 and GLM-5-Turbo via z.ai Coding Plan subscription. Full Anthropic API compatibility, 128K context, thinking mode enabled."
provider: "glm"
tagline: "Frontier reasoning models on a fixed monthly plan"
setupCommand: "claude-multi add glm"
useCases:
  - "Agentic coding with extended reasoning chains"
  - "Day-to-day development on a predictable subscription budget"
  - "Multi-file refactoring and architecture work"
  - "Code review and test generation"
pricing: "Coding Plan subscription via z.ai"
order: 1
---

GLM-5.1 is a frontier-class reasoning model accessible through z.ai's Coding Plan. It exposes a native Anthropic-compatible endpoint, so Claude Code talks to it without adapters or middleware.

## Model specs

| Role | Model | Context |
|------|-------|---------|
| Primary (Opus) | GLM-5.1 | 128K |
| Fast (Sonnet/Haiku) | GLM-5-Turbo | 128K |

Thinking mode is enabled by default. The template sets `REASONING_EFFORT` to `high` and allocates 8,000 thinking tokens, which is enough for most code tasks without burning through your context window.

Auto-compaction is tuned for the 128K context. Without it, Claude Code assumes a 200K window for unknown models and never triggers compaction, eventually crashing when the real context fills up. The template sets `CLAUDE_CODE_AUTO_COMPACT_WINDOW` to 131,072 and compacts at 75% usage.

## Setup

1. Get a Coding Plan subscription at [z.ai](https://z.ai)
2. Copy your API key from the dashboard
3. Run the setup command:

```sh
claude-multi add glm
```

4. Paste your API key when prompted

That is the whole process. The template configures the base URL, model mappings, context limits, and thinking parameters. Your instance is ready immediately.

## When to pick GLM

GLM-5.1 is a good fit when you want a fixed monthly cost instead of per-token billing. The Coding Plan gives you a generous allocation of requests, and GLM-5-Turbo handles lighter tasks (quick edits, shell commands, subagent work) at higher speed.

If your workload is bursty and you prefer paying only for what you use, look at the DeepSeek or MiMo pay-per-token templates instead.

## Pricing details

GLM uses a Coding Plan subscription model. You pay a flat monthly fee and get an allocation of requests. Check [z.ai](https://z.ai) for current pricing tiers.

## Related providers

- [DeepSeek](/providers/deepseek/) - pay-per-token, also frontier coding
- [MiniMax](/providers/minimax/) - 1M context window, subscription
- [Qwen](/providers/qwen/) - Alibaba's coder models, pay-per-token
