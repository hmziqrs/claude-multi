---
title: "Moonshot Kimi provider for Claude Code"
description: "Run Claude Code with Kimi K2.7 Code, K2.6, and K2.5 via moonshot.ai. Step-by-step setup, model specs, pricing, and when to pick Kimi over DeepSeek or GLM."
provider: "kimi"
tagline: "Three tiers built around multi-step tool use"
setupCommand: "claude-multi add kimi"
useCases:
  - "Agentic coding with complex tool chains"
  - "Multi-step debugging and investigation"
  - "Interactive pair programming"
  - "API integration and glue code"
pricing: "Pay-per-token via moonshot.ai"
order: 5
---

Kimi K2.7 Code is Moonshot AI's coding model. K2.6 and K2.5 fill out the sonnet and haiku tiers at lower price points. All three are built for multi-step tool use, which is what Claude Code spends most of its time doing. The Anthropic-compatible endpoint at moonshot.ai plugs into Claude Code directly.

## Model specs

| Role | Model | Context | Max output |
|------|-------|---------|------------|
| Opus | Kimi K2.7 Code | 256K | 65,536 |
| Sonnet | Kimi K2.6 | 256K | 65,536 |
| Haiku | Kimi K2.5 | 256K | 65,536 |

K2.7 Code maps to opus for heavy reasoning, K2.6 to sonnet, and K2.5 to haiku for fast operations. All three have 256K context and 65,536 max output.

Thinking mode is on by default with `REASONING_EFFORT: high` and 16,000 thinking tokens. Auto-compaction targets the 256K context window. Without those settings, Claude Code assumes a 200K window for unrecognized models and never compacts, so the context overflows and the session crashes. K2.7 Code also forces `preserve_thinking` mode, which keeps full reasoning content across turns.

## Setup

1. Create an account at [moonshot.ai](https://moonshot.ai) and generate an API key
2. Run the setup command:

```sh
claude-multi add kimi
```

3. Paste your API key when prompted

The template sets the base URL, model mapping, thinking parameters, context limits, and compaction thresholds.

## When to pick Kimi

Kimi suits interactive, tool-heavy workflows. If you spend most of your Claude Code time reading files, running commands, and editing code in sequence, K2.7 Code is built for that loop. Route the rest to K2.6 and K2.5, which cost less.

The 256K context window covers most day-to-day development. If you regularly work with codebases larger than 200K tokens, [DeepSeek](/providers/deepseek/) and [MiniMax](/providers/minimax/) have 1M windows.

Kimi is pay-per-token only. There is no subscription plan. If you prefer a flat monthly rate, [GLM](/providers/glm/) has a coding plan subscription.

## Pricing details

K2.7 Code costs $0.95/MTok input (cache miss), $0.19/MTok input (cache hit), $4.00/MTok output. [moonshot.ai](https://moonshot.ai) has current pricing for all three tiers.

For benchmark comparisons between K2.7 Code, GPT-5.5, and Opus 4.8, see the [Kimi K2.7 Code announcement post](/blog/kimi-k27-three-tier-agentic-coding/).

## Related providers

- [DeepSeek](/providers/deepseek/) for 1M context, also pay-per-token
- [MiMo](/providers/mimo/) for a lower cost per token, 1M context
- [GLM](/providers/glm/) for a subscription alternative
