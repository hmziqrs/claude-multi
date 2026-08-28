---
title: "DeepSeek Provider for Claude Code"
description: "Run Claude Code with DeepSeek-V4-Pro and DeepSeek-V4-Flash via deepseek.com. 1M context, thinking mode, pay-per-token pricing, no subscription."
provider: "deepseek"
tagline: "1M context, priced per token, no subscription"
setupCommand: "claude-multi add deepseek"
useCases:
  - "General-purpose coding and debugging"
  - "Complex algorithm implementation"
  - "Codebase exploration and understanding"
  - "Development work on a per-token budget"
pricing: "Pay-per-token via deepseek.com"
order: 3
---

DeepSeek-V4-Pro is a coding model with a 1M token context window. DeepSeek-V4-Flash is the cheaper, faster tier. Both sit behind a native Anthropic-compatible endpoint, so Claude Code connects without an adapter or a proxy.

## Model specs

| Role | Model | Context | Max Output |
|------|-------|---------|------------|
| Primary (Opus/Sonnet) | DeepSeek-V4-Pro | 1M | 128K |
| Fast (Haiku) | DeepSeek-V4-Flash | 1M | 128K |

The template maps V4-Pro to the Opus and Sonnet roles, and V4-Flash to the Haiku and small/fast roles. Subagent work also runs on V4-Flash, so background calls bill at the cheaper rate.

Thinking mode is enabled with `REASONING_EFFORT: high` and 32,000 thinking tokens. Effort level is set to `max`.

## Setup

1. Create an account at [deepseek.com](https://deepseek.com) and generate an API key
2. Run the setup command:

```sh
claude-multi add deepseek
```

3. Paste your API key when prompted

The template sets the base URL, model mappings, thinking parameters, and output limits.

## When to pick DeepSeek

Pick DeepSeek if you want per-token billing rather than a monthly plan. You pay for what you use and nothing when you're idle.

V4-Pro takes the complex coding work. V4-Flash is quick enough for autocomplete, shell commands, and subagent calls, where latency matters more than depth.

If you would rather have a fixed monthly cost, the GLM Coding Plan is the subscription alternative.

## Pricing details

DeepSeek is pay-per-token only, with no subscription plan. V4-Flash (the haiku-tier model) costs less than V4-Pro, so background work and subagent calls stay cheap while heavy reasoning goes to the larger model. [deepseek.com](https://deepseek.com) has the current per-token rates.

## Related providers

- [GLM](/providers/glm/) - a subscription plan instead of per-token billing
- [MiniMax](/providers/minimax/) - 1M context, 512K output
- [Qwen](/providers/qwen/) - Alibaba's three-tier coder models, pay-per-token
