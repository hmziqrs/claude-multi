---
title: "MiniMax M3 Provider for Claude Code"
description: "Run Claude Code with MiniMax-M3 via minimax.io. 1M token context window, 512K max output, frontier coding and agentic performance with native multimodal support."
provider: "minimax"
tagline: "1M context window with 512K output tokens"
setupCommand: "claude-multi add minimax"
useCases:
  - "Processing massive codebases in a single context"
  - "Full repository refactoring and migration"
  - "Long-running agentic tasks with extended tool chains"
  - "Multimodal coding with image understanding"
pricing: "Pay-per-token via minimax.io"
order: 2
---

MiniMax-M3 is a frontier model with a 1 million token context window and 512K max output. That context size changes what you can do in a single session. You can load entire monorepos, run multi-hour agentic workflows, and let the model build context across hundreds of files without hitting a wall.

## Model specs

| Role | Model | Context | Max Output |
|------|-------|---------|------------|
| All roles | MiniMax-M3 | 1M | 512K |

The template maps MiniMax-M3 to every role (Opus, Sonnet, Haiku, small/fast). There is only one model, but it handles the full range from quick shell commands to complex multi-step reasoning.

Effort level is set to `max` and thinking is enabled with `REASONING_EFFORT: high`. The model gets 32,000 thinking tokens by default, which balances depth against context consumption.

## Setup

1. Create an account at [minimax.io](https://minimax.io) and generate an API key
2. Run the setup command:

```sh
claude-multi add minimax
```

3. Paste your API key when prompted

The template configures the base URL, model mapping, thinking parameters, and output limits. No manual editing required.

## When to pick MiniMax

MiniMax stands out when you need context length. If you work on large codebases, do multi-repository analysis, or run agentic tasks that accumulate a lot of state, the 1M window means fewer compaction cycles and better coherence across long sessions.

The 512K output limit also opens up workflows that other providers cannot match. You can generate entire application scaffolds, produce comprehensive documentation, or get detailed analysis in a single response.

For shorter, more interactive coding sessions, DeepSeek or GLM may offer better cost efficiency at comparable quality.

## Pricing details

MiniMax uses pay-per-token billing. Cost scales linearly with usage, and there is no monthly commitment. Check [minimax.io](https://minimax.io) for current per-token rates.

## Related providers

- [DeepSeek](/providers/deepseek/) - strong coding, 1M context, pay-per-token
- [GLM](/providers/glm/) - fixed monthly subscription plan
- [Kimi](/providers/kimi/) - competitive pricing, agentic coding
