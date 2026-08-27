---
title: "GLM-5.3 Coding Plan Provider for Claude Code"
description: "Run Claude Code with GLM-5.3, GLM-5.3-Flash, and GLM-5-Turbo via z.ai Coding Plan subscription. Full Anthropic API compatibility, up to 1M context, thinking mode enabled."
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

GLM-5.3 is a frontier reasoning model available through z.ai's Coding Plan. Its sonnet-tier companion GLM-5.3-Flash is Z.ai's first native multimodal model in the GLM-5 series. Both expose a native Anthropic-compatible endpoint, so Claude Code talks to them without adapters or middleware.

## Model specs

| Role | Model | Context | Max output |
|------|-------|---------|------------|
| Primary (Opus) | `glm-5.3[1m]` | 1M | 128K |
| Standard (Sonnet) | `glm-5.3-flash[1m]` | 1M | 128K |
| Fast (Haiku) | `glm-5-turbo` | 200K | 128K |

GLM-5.3-Flash is natively multimodal, supports the full 1M-token context window through the `[1m]` suffix, and carries 3x the Coding Plan quota of GLM-5.3, which makes it a good fit for the day-to-day sonnet workload at a fraction of the quota cost.

The older `glm-5.2` and `glm-5.1` ids are no longer served on the Coding Plan endpoint. Requests for them are automatically routed to `glm-5.3`, so existing configs keep working, but the ids are effectively deprecated.

Thinking is always on: GLM-5.3 rejects requests that disable it, and supports `reasoning_effort` values of `low`, `high`, and `max`. The template sets `REASONING_EFFORT` to `high` and allocates 8,000 thinking tokens, which is enough for most code tasks without consuming much of the context window.

Context windows differ across tiers, so the template sets them per model rather than through a single global override. GLM-5.3 and GLM-5.3-Flash carry a `[1m]` suffix that tells Claude Code their real 1M window in the opus and sonnet slots, and Claude Code's default 200K assumption for unrecognized models already matches GLM-5-Turbo exactly. Auto-compaction therefore triggers at the right point for every tier, with no `CLAUDE_CODE_AUTO_COMPACT_WINDOW` override required.

## Setup

1. Get a Coding Plan subscription at [z.ai](https://z.ai)
2. Copy your API key from the dashboard
3. Run the setup command:

```sh
claude-multi add glm
```

4. Paste your API key when prompted

The template handles the base URL, model mappings, context limits, and thinking parameters.

## When to pick GLM

GLM-5.3 is a good fit when you want a fixed monthly cost instead of per-token billing. GLM-5-Turbo handles the light work (quick edits, shell commands, subagent calls), GLM-5.3 takes heavier refactoring and long agentic runs, and GLM-5.3-Flash covers day-to-day coding while draining the balance a third as fast as GLM-5.3. All of it runs inside one plan.

If your workload is bursty and you prefer paying only for what you use, look at the [DeepSeek](/providers/deepseek/) or [MiMo](/providers/mimo/) pay-per-token templates instead.

## Pricing details

GLM reaches Claude Code through Z.ai's Coding Plan, a monthly subscription. The Anthropic-compatible endpoint is gated to the plan; there is no pay-per-token Anthropic URL for GLM, and GLM-5.3 is Coding Plan-only at launch with general pay-as-you-go API access coming soon.

Usage is metered in credits: `(input x input_mult + cached_input x cached_mult + output x output_mult) / 10,000`, with multipliers per model:

| Model | Input | Cached input | Output |
|-------|-------|--------------|--------|
| GLM-5.3 | 6.9 | 1.7 | 24 |
| GLM-5-Turbo | 5.7 | 1.5 | 21 |
| GLM-4.7 | 4.6 | 1.2 | 16 |
| GLM-4.6V (vision MCP tools only) | 1.2 | 0.3 | 2.7 |

GLM-5.3-Flash is fully available on the Coding Plan and bills through the same points system rather than its own multiplier row. It carries 3x the GLM-5.3 quota, so sonnet-tier day-to-day usage drains the balance far more slowly; off-peak calls cost 50% of the standard rate like every other model on the plan.

Off-peak requests count at 50% of the standard credit rate. Peak is only Monday-Friday 14:00-18:00 UTC+8, so nights, weekends, and weekday mornings all bill at the off-peak rate.

| Plan | 5-hour quota | Weekly quota |
|------|--------------|--------------|
| Lite | 2,000 credits | 10,000 credits |
| Pro  | 12,000 credits | 60,000 credits |
| Max  | 28,000 credits | 140,000 credits |

Plans start from $18 USD/month for Lite, with 20% off quarterly and 30% off yearly billing. This points system replaced the older peak/off-peak multiplier plan, which was discontinued for new users on 2026-07-30. GLM-5-Turbo is also on the standard pay-as-you-go API, but that route isn't Anthropic-compatible, so claude-multi doesn't use it. For benchmarks and a full breakdown of the plan, see the [GLM-5.3 announcement post](/blog/glm-5-3-coding-plan/). The [GLM-5.2 post](/blog/glm-5-2-three-tier-coding-plan/) covers how the plan looked at launch, and [z.ai](https://z.ai) has current Pro and Max pricing.

## Related providers

- [DeepSeek](/providers/deepseek/) - pay-per-token, also frontier coding
- [MiniMax](/providers/minimax/) - 1M context window, subscription
- [Qwen](/providers/qwen/) - Alibaba's coder models, pay-per-token
