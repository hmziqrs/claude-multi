---
title: "MiniMax M3 Provider for Claude Code"
description: "Run Claude Code with MiniMax-M3 via minimax.io. 1M token context window, 512K max output, native multimodal support, one model across every role."
provider: "minimax"
tagline: "1M context window with 512K output tokens"
setupCommand: "claude-multi add minimax"
useCases:
  - "Holding a large codebase in a single context"
  - "Full repository refactoring and migration"
  - "Long-running agentic tasks with extended tool chains"
  - "Multimodal coding with image understanding"
pricing: "Pay-per-token via minimax.io"
order: 2
---

MiniMax-M3 has a 1 million token context window and a 512K max output. That size changes what fits in a single session. You can load a whole monorepo, run long agentic workflows, and let the model accumulate context across hundreds of files before it needs to compact.

## Model specs

| Role | Model | Context | Max Output |
|------|-------|---------|------------|
| All roles | MiniMax-M3 | 1M | 512K |

The template maps MiniMax-M3 to every role (Opus, Sonnet, Haiku, small/fast). There is only one model, so quick shell commands and complex multi-step reasoning both go to it.

Effort level is set to `max` and thinking is enabled with `REASONING_EFFORT: high`. The model gets 32,000 thinking tokens by default, which is deep enough for most work without eating much of the context window.

## Setup

1. Create an account at [minimax.io](https://minimax.io) and generate an API key
2. Run the setup command:

```sh
claude-multi add minimax
```

3. Paste your API key when prompted

The template sets the base URL, model mapping, thinking parameters, and output limits. You should not need to edit anything by hand.

## When to pick MiniMax

Pick MiniMax when context length is the constraint. If you work on large codebases, do multi-repository analysis, or run agentic tasks that accumulate a lot of state, the 1M window means fewer compaction cycles.

The 512K output limit also makes a few things practical that other providers cap out on: generating an application scaffold in one pass, or getting a long analysis back without truncation.

For shorter, more interactive sessions, DeepSeek or GLM may cost you less.

## Pricing details

MiniMax bills per token through [minimax.io](https://minimax.io) with no monthly commitment. Token Plan subscriptions are also available (Plus / Max / Ultra monthly tiers). Both routes share the same `api.minimax.io` endpoint, and your API key type decides which quota gets consumed.

| Tier | Input / 1M | Output / 1M |
|------|-----------|-------------|
| Standard (up to 512K context) | $0.60 | $2.40 |
| Long context (512K to 1M) | $1.20 | $4.80 |
| Cache read | $0.12 | n/a |

For benchmark comparisons vs Opus 4.7 and GPT-5.5, see the [MiniMax M3 announcement post](/blog/minimax-m3-one-million-context-frontier-coding/).

## Related providers

- [DeepSeek](/providers/deepseek/) - 1M context, pay-per-token
- [GLM](/providers/glm/) - fixed monthly subscription plan
- [Kimi](/providers/kimi/) - 256K context, built for tool-heavy work
