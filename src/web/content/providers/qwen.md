---
title: "Alibaba Qwen Provider for Claude Code"
description: "Run Claude Code with Qwen3-Coder-Next, Qwen3-Coder-Plus, and Qwen3-Coder-Flash via Alibaba DashScope. Three model tiers, pay-per-token pricing, 128K context."
provider: "qwen"
tagline: "Three-tier coder models from Alibaba Cloud"
setupCommand: "claude-multi add qwen"
useCases:
  - "Full-stack web development"
  - "Code completion and generation"
  - "Testing and CI pipeline work"
  - "Multi-language codebase navigation"
pricing: "Pay-per-token via Alibaba DashScope"
order: 6
---

Qwen3-Coder is Alibaba's coding model family, in three tiers: Next for heavy reasoning, Plus for balanced work, and Flash for speed. The DashScope API has a native Anthropic-compatible endpoint, so Claude Code connects directly.

## Model specs

| Role | Model | Context | Max Output |
|------|-------|---------|------------|
| Primary (Opus) | Qwen3-Coder-Next | 128K | 65,536 |
| Balanced (Sonnet) | Qwen3-Coder-Plus | 128K | 65,536 |
| Fast (Haiku) | Qwen3-Coder-Flash | 128K | 65,536 |

Each tier maps to the matching Claude Code role. Heavy reasoning goes to Next, everyday coding to Plus, quick tasks to Flash. Subagent work also runs on Flash.

Thinking mode is enabled with `REASONING_EFFORT: high` and 16,000 thinking tokens. Auto-compaction is tuned for the 128K context window.

## Setup

1. Create an account at [Alibaba DashScope](https://dashscope.aliyuncs.com) (international endpoint) and generate an API key
2. Run the setup command:

```sh
claude-multi add qwen
```

3. Paste your API key when prompted

The template configures the international endpoint at `dashscope-intl.aliyuncs.com`. If you are in mainland China, you may want to use the domestic endpoint instead.

## Coding Plan alternative

Alibaba also sells a Coding Plan subscription on its own endpoint. If you prefer a monthly commitment over pay-per-token, use the `qwen-coding` template:

```sh
claude-multi add qwen-coding
```

The model mappings are identical. Only the base URL changes.

## When to pick Qwen

Pick Qwen if you want three quality tiers at three price points. Flash is fast and cheap for autocomplete and simple edits, Plus handles most coding tasks, and Next takes architecture decisions and complex debugging.

Because billing is per token, your cost tracks the tier you route work to. Background work runs on Flash while the harder tasks go to Next.

## Pricing details

Qwen3-Coder comes two ways: pay-per-token via [DashScope](https://dashscope.aliyuncs.com), or a Coding Plan subscription (the `qwen-coding` template, same models, different endpoint). Each tier has its own rate. Flash is the cheapest and Next the most expensive, so your bill scales with how much you route to Next. The DashScope pricing page has current rates.

## Related providers

- [DeepSeek](/providers/deepseek/) - pay-per-token, 1M context
- [GLM](/providers/glm/) - subscription plan, also a Chinese provider
- [MiniMax](/providers/minimax/) - larger context window
