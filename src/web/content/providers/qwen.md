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

Qwen3-Coder is Alibaba's coding model family with three tiers: Next for heavy reasoning, Plus for balanced work, and Flash for speed. The DashScope API exposes a native Anthropic-compatible endpoint, so Claude Code connects directly.

## Model specs

| Role | Model | Context | Max Output |
|------|-------|---------|------------|
| Primary (Opus) | Qwen3-Coder-Next | 128K | 65,536 |
| Balanced (Sonnet) | Qwen3-Coder-Plus | 128K | 65,536 |
| Fast (Haiku) | Qwen3-Coder-Flash | 128K | 65,536 |

Each tier maps to the corresponding Claude Code role. Heavy reasoning goes to Next, everyday coding to Plus, and quick tasks to Flash. Subagent work also uses Flash.

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

Alibaba also offers a Coding Plan subscription with its own endpoint. If you prefer a monthly commitment over pay-per-token, use the `qwen-coding` template:

```sh
claude-multi add qwen-coding
```

The model mappings are identical. Only the base URL changes.

## When to pick Qwen

Qwen is a solid choice if you want tiered model quality at different price points. Flash is fast and cheap for autocomplete and simple edits. Plus handles most coding tasks well. Next brings the deepest reasoning for architecture decisions and complex debugging.

The pay-per-token model means you pay proportionally. Background work runs on Flash at lower cost while complex tasks get the full power of Next.

## Pricing details

Qwen3-Coder is available two ways: pay-per-token via [DashScope](https://dashscope.aliyuncs.com), or a Coding Plan subscription (use the `qwen-coding` template, same models, different endpoint). Each tier has its own rate — Flash is cheapest, Next is most expensive — so cost scales with how much heavy reasoning you route to Next. Check the DashScope pricing page for current rates.

## Related providers

- [DeepSeek](/providers/deepseek/) - similar positioning, 1M context
- [GLM](/providers/glm/) - subscription model, also Chinese provider
- [MiniMax](/providers/minimax/) - larger context window
