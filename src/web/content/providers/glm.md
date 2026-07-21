---
title: "GLM Coding Plan Provider for Claude Code"
description: "Run Claude Code with GLM-5.2, GLM-5.1 and GLM-5-Turbo via z.ai Coding Plan subscription. Full Anthropic API compatibility, up to 1M context, thinking mode enabled."
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

GLM-5.2 is a frontier-class reasoning model accessible through z.ai's Coding Plan. It exposes a native Anthropic-compatible endpoint, so Claude Code talks to it without adapters or middleware.

## Model specs

| Role | Model | Context |
|------|-------|---------|
| Primary (Opus) | GLM-5.2 | 1M |
| Standard (Sonnet) | GLM-5.1 | 200K |
| Fast (Haiku) | GLM-5-Turbo | 200K |

Thinking mode is enabled by default. The template sets `REASONING_EFFORT` to `high` and allocates 8,000 thinking tokens, which is enough for most code tasks without burning through your context window.

Context windows are mixed across tiers, so the template exposes them per-model rather than with a single global override. GLM-5.2 carries a `[1m]` suffix that tells Claude Code its real 1M window, while Claude Code's default 200K assumption for unrecognized models already matches GLM-5.1 and GLM-5-Turbo exactly — so auto-compaction triggers at the right point for every tier without any `CLAUDE_CODE_AUTO_COMPACT_WINDOW` override.

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

GLM-5.2 is a good fit when you want a fixed monthly cost instead of per-token billing. The Coding Plan gives you a generous allocation of requests, and GLM-5-Turbo handles lighter tasks (quick edits, shell commands, subagent work) at higher speed, while GLM-5.1 covers everyday coding in between.

If your workload is bursty and you prefer paying only for what you use, look at the DeepSeek or MiMo pay-per-token templates instead.

## Pricing details

GLM reaches Claude Code through Z.ai's Coding Plan, a monthly subscription. The Anthropic-compatible endpoint is gated to the plan; there is no pay-per-token Anthropic URL for GLM.

| Plan | Price / month | Usage |
|------|---------------|-------|
| Lite | $18 | 1x baseline |
| Pro  | $72 | ~5x |
| Max  | $160 | ~20x |

Opus-tier models (GLM-5.2, GLM-5.1, GLM-5-Turbo) count at 3x during peak hours and 2x off-peak. GLM-5-Turbo is also on the standard API at $1.20/M input and $4.00/M output, but that route isn't Anthropic-compatible, so claude-multi doesn't use it. See the [GLM-5.2 announcement post](/blog/glm-5-2-three-tier-coding-plan/) for the full plan breakdown and benchmarks, and [z.ai](https://z.ai) for current pricing.

## Related providers

- [DeepSeek](/providers/deepseek/) - pay-per-token, also frontier coding
- [MiniMax](/providers/minimax/) - 1M context window, subscription
- [Qwen](/providers/qwen/) - Alibaba's coder models, pay-per-token
