---
title: "GLM-5.3 Coding Plan Provider for Claude Code"
description: "Run Claude Code on z.ai's Coding Plan with GLM-5.3 for main work and GLM-5.3-Flash for the haiku slot. 1M context and credit pricing."
provider: "glm"
tagline: "GLM-5.3 for main work, Flash for fast tasks"
setupCommand: "claude-multi add glm"
useCases:
  - "Agentic coding with extended reasoning chains"
  - "Day-to-day development on a predictable subscription budget"
  - "Multi-file refactoring and architecture work"
  - "Code review and test generation"
pricing: "Coding Plan subscription via z.ai"
order: 1
updated: 2026-11-03
---

GLM-5.3 is Z.ai's flagship coding model, sold through the GLM Coding Plan instead of a metered Anthropic API. Z.ai documents [GLM-5.3](https://docs.z.ai/guides/llm/glm-5.3) and [GLM-5.3-Flash](https://docs.z.ai/guides/llm/glm-5.3-flash) as the two models on the plan. Requests for GLM-5.2 and GLM-5.1 route to GLM-5.3, and GLM-4.7 requests route to GLM-5.3-Flash. The endpoint at `api.z.ai/api/anthropic` speaks Anthropic Messages directly, so Claude Code connects without an adapter.

## Model specs

| Role | Model | Context | Max output |
|------|-------|---------|------------|
| Primary, opus, sonnet, fable | `glm-5.3[1m]` | 1M | 128K |
| Haiku | `glm-5.3-flash[1m]` | 1M | 128K |

The template maps the Claude Code roles to two GLM models. Primary, opus, sonnet, and fable use GLM-5.3. Haiku uses GLM-5.3-Flash.

GLM-5.3 is text-only and always reasons. GLM-5.3-Flash is the first native multimodal model in the series, with text, image, video, and file input. It has 320B total parameters and 18B active, and it carries 3x the Coding Plan quota of GLM-5.3.

Both models have a 1M window. The `[1m]` suffix is a Claude Code context hint, not part of the model name sent to Z.ai. It tells Claude Code the real window. Without it, Claude Code assumes 200K for an unrecognized model and compacts early. The template also sets `CLAUDE_CODE_AUTO_COMPACT_WINDOW` to 1000000, so both slots compact at the same point.

Thinking cannot be disabled on GLM-5.3 or Flash. `reasoning_effort` accepts `low`, `high`, and `max`. Z.ai defaults to `max`, while the template sets `high` and 8,000 thinking tokens to keep latency down.

## Template status: current

The 0.13.0 template uses the mapping from Z.ai's manual Claude Code configuration: `glm-5.3[1m]` in primary, opus, sonnet, and fable, `glm-5.3-flash[1m]` in haiku, and the Coding Plan endpoint. It sets auto-compact to 1000000, `CLAUDE_CODE_MAX_OUTPUT_TOKENS` to 128000, effort to `high`, `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT` to `1`, `MAX_THINKING_TOKENS` to 8000, and disables nonessential traffic. No manual edits are needed after `claude-multi add glm`.

Z.ai's current default configuration maps opus, sonnet, and haiku to `glm-5.3-flash[1m]`. The template keeps the manual split so the main slots use the flagship model. `MAX_THINKING_TOKENS` is a client-side hint; Z.ai derives thinking depth from the effort level.

## Setup

1. Get a Coding Plan subscription at [z.ai](https://z.ai)
2. Copy your API key from the dashboard
3. Run the setup command:

```sh
claude-multi add glm
```

4. Paste your API key when prompted

The template writes the base URL, model mappings, context limits, and thinking parameters into `~/.claude-<name>/settings.json`.

## Pricing details

Usage is metered in credits: `(input x input_mult + cached_input x cached_mult + output x output_mult) / 10,000`. The multipliers differ by model:

| Model | Input | Cached input | Output |
|-------|-------|--------------|--------|
| GLM-5.3 | 6.9 | 1.7 | 24 |
| GLM-5.3-Flash | 2.3 | 0.56 | 8 |

The plan supports GLM-5.3 and GLM-5.3-Flash. Z.ai's credit table lists multipliers for those two models.

At standard rates, GLM-5.3 consumes exactly 3x the credits of Flash: 6.9 vs 2.3 on input and 24 vs 8 on output. Cached input is the cheapest line on both models, which rewards long sessions that resend the same files.

| Plan | 5-hour quota | Weekly quota |
|------|--------------|--------------|
| Lite | 2,000 credits | 10,000 credits |
| Pro  | 12,000 credits | 60,000 credits |
| Max  | 28,000 credits | 140,000 credits |

Plans start at $18/month for Lite. Off-peak calls bill at 50% of the standard credit rate. Peak is Monday to Friday, 14:00-18:00 UTC+8, which is 06:00-10:00 UTC. That window lands in the European morning and late night on the US west coast, so check it before scheduling a long batch. Nights, weekends, and weekday mornings and evenings in Asia bill off-peak.

The [GLM-5.3 announcement post](/blog/glm-5-3-coding-plan/) has benchmarks and a plan breakdown. [Z.ai's Coding Plan docs](https://docs.z.ai/devpack/overview) list the live quotas and multipliers.

## What to watch

GLM-5.3 launched as a Coding Plan model. Z.ai's docs present the Anthropic endpoint as part of the plan, and the metered GLM API uses an OpenAI-compatible URL. There is no pay-per-token Anthropic route for GLM today, so this template requires a subscription. If Z.ai opens a metered Anthropic endpoint, claude-multi will need a second GLM template. Pointing the current template at the OpenAI URL will not work.

GLM-5.3-FlashX, the 200 tokens/s variant, is not on the Coding Plan yet. The plan carries GLM-5.3-Flash, not FlashX.

## Related providers

- [DeepSeek](/providers/deepseek/) - pay-per-token, 1M context
- [MiniMax](/providers/minimax/) - 1M context window, subscription or per-token
- [Qwen](/providers/qwen/) - Alibaba's Qwen models, pay-per-token or Coding Plan
