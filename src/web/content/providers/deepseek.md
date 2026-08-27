---
title: "DeepSeek Provider for Claude Code"
description: "Run Claude Code with DeepSeek-V4-Pro and DeepSeek-V4-Flash via deepseek.com. Frontier coding performance, 1M context, thinking mode, pay-per-token pricing."
provider: "deepseek"
tagline: "Frontier coding at per-token pricing with a 1M context"
setupCommand: "claude-multi add deepseek"
useCases:
  - "General-purpose coding and debugging"
  - "Complex algorithm implementation"
  - "Codebase exploration and understanding"
  - "Cost-effective development workflows"
pricing: "Pay-per-token via deepseek.com"
order: 3
---

DeepSeek-V4-Pro is a frontier coding model with a 1M token context window and strong performance across benchmarks. DeepSeek-V4-Flash handles fast tasks at a fraction of the cost. Both run behind a native Anthropic-compatible endpoint, so Claude Code connects without adapters or middleware.

## Model specs

| Role | Model | Context | Max Output |
|------|-------|---------|------------|
| Primary (Opus/Sonnet) | DeepSeek-V4-Pro | 1M | 128K |
| Fast (Haiku) | DeepSeek-V4-Flash | 1M | 128K |

The template maps V4-Pro to Opus and Sonnet roles for heavy lifting, and V4-Flash to Haiku and small/fast roles for quick tasks. Subagent work also uses V4-Flash, keeping background operations cheap.

Thinking mode is enabled with `REASONING_EFFORT: high` and 32,000 thinking tokens. Effort level is set to `max`.

## Setup

1. Create an account at [deepseek.com](https://deepseek.com) and generate an API key
2. Run the setup command:

```sh
claude-multi add deepseek
```

3. Paste your API key when prompted

The template handles the base URL, model mappings, thinking parameters, and output limits.

## When to pick DeepSeek

DeepSeek is the default recommendation for developers who want frontier performance without a subscription. The pay-per-token model means you only pay for what you use, and the pricing is competitive across the board.

V4-Pro handles complex coding tasks at the same quality tier as much more expensive models. V4-Flash is fast enough for interactive autocomplete, shell commands, and subagent work where latency matters more than depth.

If you prefer a fixed monthly cost over variable billing, the GLM Coding Plan is the subscription alternative.

## Pricing details

DeepSeek is pay-per-token only, with no subscription plan. V4-Flash (the haiku-tier model) is markedly cheaper than V4-Pro, so background work and subagent calls cost little while heavy reasoning uses the larger model. Check [deepseek.com](https://deepseek.com) for current per-token rates.

## Related providers

- [GLM](/providers/glm/) - similar quality on a subscription plan
- [MiniMax](/providers/minimax/) - 1M context, 512K output
- [Qwen](/providers/qwen/) - Alibaba's alternative, pay-per-token
