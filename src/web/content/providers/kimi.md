---
title: "Moonshot Kimi Provider for Claude Code"
description: "Run Claude Code with Kimi K2.7, K2.6, K2.5 via moonshot.ai. Strong agentic coding performance, 128K context, thinking mode, pay-per-token only."
provider: "kimi"
tagline: "Agentic coding with strong tool-use and reasoning"
setupCommand: "claude-multi add kimi"
useCases:
  - "Agentic coding with complex tool chains"
  - "Multi-step debugging and investigation"
  - "Interactive pair programming"
  - "API integration and glue code"
pricing: "Pay-per-token via moonshot.ai"
order: 5
---

Kimi K2.7 is Moonshot AI's flagship coding-focused model with strong performance on agentic benchmarks. K2.6 and K2.5 provide capable tier options at different price points. All three excel at multi-step tool use, which is the core of how Claude Code operates. The Anthropic-compatible endpoint at moonshot.ai connects directly to Claude Code without any adapters.

## Model specs

| Role | Model | Context | Max Output |
|------|-------|---------|------------|
| Opus | Kimi K2.7 | 128K | 65,536 |
| Sonnet | Kimi K2.6 | 128K | 65,536 |
| Haiku | Kimi K2.5 | 128K | 65,536 |

The template maps K2.7 to the Opus role for heavy reasoning, K2.6 to Sonnet for balanced tasks, and K2.5 to Haiku for fast operations. All three tiers share the same 128K context and 65,536 max output.

Thinking mode is enabled with `REASONING_EFFORT: high` and 16,000 thinking tokens. Auto-compaction is tuned for the 128K context window. Without these settings, Claude Code assumes a 200K window for unrecognized models and never compacts, leading to context overflow crashes.

## Setup

1. Create an account at [moonshot.ai](https://moonshot.ai) and generate an API key
2. Run the setup command:

```sh
claude-multi add kimi
```

3. Paste your API key when prompted

The template configures the base URL, model mapping, thinking parameters, context limits, and compaction thresholds.

## When to pick Kimi

Kimi is a strong choice for interactive, tool-heavy workflows. If you spend most of your Claude Code time in agentic mode (reading files, running commands, editing code in sequence), K2.7's improved agentic capabilities handle that loop exceptionally well. K2.6 and K2.5 offer solid performance at lower cost for less demanding tasks.

The 128K context window is sufficient for most day-to-day development. If you regularly work with codebases larger than 100K tokens, consider MiniMax or DeepSeek for their 1M windows.

Kimi is pay-per-token only. There is no subscription plan.

## Pricing details

Moonshot charges per token with no minimums. Check [moonshot.ai](https://moonshot.ai) for current pricing.

## Related providers

- [DeepSeek](/providers/deepseek/) - 1M context, also pay-per-token
- [MiMo](/providers/mimo/) - lower cost per token, 1M context
- [GLM](/providers/glm/) - subscription alternative
