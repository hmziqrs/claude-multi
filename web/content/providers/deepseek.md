---
title: "DeepSeek V4.1 Flash Provider for Claude Code"
description: "Run Claude Code with DeepSeek V4.1 Flash. 1M context, 128K output in Claude Code, thinking mode, off-peak pricing, and V4-Pro as a custom option."
provider: "deepseek"
tagline: "1M context, flash pricing, no subscription"
setupCommand: "claude-multi add deepseek"
useCases:
  - "General-purpose coding and debugging"
  - "Complex algorithm implementation"
  - "Codebase exploration and understanding"
  - "Development work on a per-token budget"
pricing: "Pay-per-token via deepseek.com"
order: 3
updated: 2026-10-31
---

DeepSeek serves two Anthropic-compatible models: `deepseek-flash`, the DeepSeek-V4.1-Flash-1017 checkpoint, and `deepseek-v4-pro`, the DeepSeek-V4-Pro-0813 checkpoint. Both have a 1M token context window and up to 384K output. There is no released V4.1 Pro. The endpoint at `api.deepseek.com/anthropic` connects to Claude Code without an adapter.

## Model specs

| Role | Model | Context | Max output |
|------|-------|---------|------------|
| Primary, opus, sonnet | `deepseek-flash[1m]` | 1M | 384K |
| Haiku, subagents | `deepseek-flash` | 1M | 384K |
| Custom option | `deepseek-v4-pro[1m]` | 1M | 384K |
| Legacy alias | `deepseek-v4-flash` | 1M | 384K |

Flash is the official Claude Code default. [DeepSeek's Claude Code guide](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code) sets the main model, opus, and sonnet to `deepseek-flash[1m]`, and haiku and subagents to `deepseek-flash`. The template follows that mapping.

`deepseek-v4-pro` is the previous generation and remains available as a manual or custom option. There is no released V4.1 Pro, so `deepseek-v4-pro` is still the Pro model. It handles complex reasoning and long analysis. Flash handles main work, background calls, subagent traffic, and quick edits. Flash also accepts image input; Pro does not.

`deepseek-v4-flash` is a legacy name. DeepSeek still accepts it, but requests route to V4.1-Flash-1017 and bill at the Flash rate. The old model behind that ID is retired. Use `deepseek-flash` in new configs.

Thinking is enabled by default. Both models support thinking and non-thinking modes, and the template sets `CLAUDE_CODE_EFFORT_LEVEL` to `max` with 32,000 thinking tokens.

## Template status: current

The 0.13.0 template points primary, opus, and sonnet at `deepseek-flash[1m]` and haiku and subagents at `deepseek-flash`. It sets `CLAUDE_CODE_AUTO_COMPACT_WINDOW` to 786432, `CLAUDE_CODE_MAX_OUTPUT_TOKENS` to 128000, effort to `max`, and thinking to 32,000 tokens. No manual edit is required.

The Pro model is not the default. To use it, set the main slots to `deepseek-v4-pro[1m]` in `~/.claude-<name>/settings.json` and expect the Pro rate. DeepSeek's server also maps request model names that start with `claude-opus` to `deepseek-v4-pro`. That mapping applies to clients that send Claude model names rather than the explicit IDs above.

The `[1m]` suffix is a Claude Code context hint, not part of the vendor model name. It tells Claude Code the real 1M window. Without it, the client assumes 200K and compacts early.

Claude Code caps a single response at 128K for an unrecognized model ID, so the template sets `CLAUDE_CODE_MAX_OUTPUT_TOKENS` to 128000 even though the model supports 384K. The extra model headroom is not reachable through Claude Code.

## Setup

1. Create an account at [deepseek.com](https://deepseek.com) and generate an API key
2. Run the setup command:

```sh
claude-multi add deepseek
```

3. Paste your API key when prompted

The template writes the base URL, model mappings, thinking parameters, and output limits.

## Pricing details

DeepSeek bills per token. Off-peak rates are half of peak rates. Peak is 01:00-04:00 and 06:00-10:00 UTC, Monday through Friday, excluding Chinese public holidays. Everything else is off-peak, including weekends and the full holiday days.

Off-peak:

| Model | Input, cache hit | Input, cache miss | Output |
|-------|------------------|-------------------|--------|
| `deepseek-flash` | $0.003 | $0.15 | $0.60 |
| `deepseek-v4-pro` | $0.022 | $0.66 | $1.98 |

Peak:

| Model | Input, cache hit | Input, cache miss | Output |
|-------|------------------|-------------------|--------|
| `deepseek-flash` | $0.006 | $0.30 | $1.20 |
| `deepseek-v4-pro` | $0.044 | $1.32 | $3.96 |

All rates are per 1M tokens. [DeepSeek's pricing page](https://api-docs.deepseek.com/quick_start/pricing) is the source for both tables.

## Cache pricing

DeepSeek caches repeated request prefixes automatically. The first pass over a system prompt or file context bills at the cache-miss rate. Later requests that reuse the same prefix bill the repeated tokens at the cache-hit rate.

The gap is large. A Flash cache hit costs about 2% of a miss, and a Pro hit costs about 3%. In an agent loop that resends the same instructions and repository context, most input tokens can land on the hit line. The pricing page lists no separate cache-write fee, so you pay the miss rate once and the hit rate on reuse.

## Where it fits

DeepSeek is the straightforward pay-per-token option: no monthly minimum, no plan quota, no regional endpoint choice. Flash is the shipped default and one of the cheapest 1M-context models here, which makes it a good fit for main work, subagents, and high-volume edits. Pro costs roughly 4.4x Flash on input and 3.3x on output, so it is a deliberate upgrade rather than the default.

Claude Code caps output at 128,000 tokens for an unrecognized model ID, so the 384K model maximum is not reachable through this template.

The peak windows are tied to Chinese working hours. In UTC they run from 01:00 to 04:00 and 06:00 to 10:00, which is morning in Europe and late night on the US west coast. Batch jobs scheduled outside those windows pay half.

If you want a fixed monthly bill instead, use the [GLM Coding Plan](/providers/glm/).

## Related providers

- [GLM](/providers/glm/) - a subscription plan instead of per-token billing
- [MiniMax](/providers/minimax/) - 1M context, 512K output
- [Qwen](/providers/qwen/) - Alibaba's Qwen models, pay-per-token or Coding Plan
