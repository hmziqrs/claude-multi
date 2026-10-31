---
title: "Xiaomi MiMo V2.6 Provider for Claude Code"
description: "Run Claude Code with MiMo-V2.6-Pro and V2.6-Flash via xiaomimimo.com. 1M context, 128K output, multimodal input, pay-per-token or Token Plan."
provider: "mimo"
tagline: "1M context, multimodal input, two price tiers"
setupCommand: "claude-multi add mimo"
useCases:
  - "Coding work where per-token cost is the constraint"
  - "Large-scale refactoring and code generation"
  - "Agentic workflows with image, video, or audio input"
  - "Teams working to a tight API budget"
pricing: "Pay-per-token via xiaomimimo.com"
order: 4
updated: 2026-10-31
---

MiMo-V2.6-Pro is Xiaomi's flagship reasoning model, with a 1M token context window and support for text, image, video, and audio input. MiMo-V2.6-Flash is the cheaper tier for high-volume work. Both use the Anthropic-compatible endpoint at `api.xiaomimimo.com/anthropic`, so Claude Code connects directly.

> Template status: current. claude-multi 0.13.0 ships `mimo-v2.6-pro[1m]` and `mimo-v2.6-flash[1m]` in both the pay-as-you-go and Token Plan templates. It sets `CLAUDE_CODE_MAX_OUTPUT_TOKENS` to 128000 and `API_TIMEOUT_MS` to 3000000. Existing instances pick up the change with `claude-multi doctor fix`.

## Model specs

| Role | Model | Context | Max output |
|------|-------|---------|------------|
| Primary (Opus/Sonnet) | `mimo-v2.6-pro[1m]` | 1M | 128K |
| Fast (Haiku/subagents) | `mimo-v2.6-flash[1m]` | 1M | 128K |

V2.6 Pro handles complex projects, long-horizon agent tasks, and multimodal analysis. V2.6 Flash handles high-frequency calls, large batch work, and subagent traffic. Both output text only.

Xiaomi retired V2.5-Pro and V2.5 on October 21, 2026 at 10:00 UTC+8. The old IDs return errors, so a config created before that date will fail until the model names are changed.

## Upgrading from V2.5

If you created a MiMo instance before October 21, 2026, its settings still name the retired V2.5 IDs. Run:

```sh
claude-multi doctor check
claude-multi doctor fix
```

The sync replaces the model slots and adds `mimo-v2.6-flash[1m]` for subagents. Both `mimo` and `mimo-token` instances use the same model IDs; only the base URL and key differ. The `[1m]` suffix is a Claude Code context hint, not part of the vendor model name. It tells the client the real 1M window instead of the 200K default.

## Setup

1. Create an account at [xiaomimimo.com](https://xiaomimimo.com) and generate an API key
2. Run the setup command:

```sh
claude-multi add mimo
```

3. Paste your API key when prompted

The template writes the base URL, V2.6 Pro and Flash model slots, and `CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000`.

## Pricing details

Xiaomi bills per token with no monthly minimum on the standard API. Cache hits are cheap enough that long, repeated context barely moves the bill.

| Model | Input / 1M | Output / 1M | Cache hit / 1M |
|-------|-----------|-------------|----------------|
| MiMo-V2.6-Pro | $0.435 | $0.87 | $0.0036 |
| MiMo-V2.6-Flash | $0.14 | $0.28 | $0.0028 |

A Pro cache hit costs about 0.8% of the input rate. A Flash hit costs about 2%. The pricing pages list no separate cache-write fee, so the first pass bills at the input rate and reuse bills at the hit rate.

At these rates, V2.6 Flash is one of the cheapest 1M-context models in claude-multi. It undercuts DeepSeek Flash on output at any hour, and its input rate is slightly lower even off-peak. Pro costs about 3.1x Flash on input and output.

Rates come from Xiaomi's model pages for [V2.6-Pro](https://mimo.mi.com/models/en-US/mimo-v2.6-pro) and [V2.6-Flash](https://mimo.mi.com/models/en-US/mimo-v2.6-flash).

## Token Plan

Xiaomi also sells a [Token Plan subscription](https://platform.xiaomimimo.com/docs/en-US/tokenplan/Token%20Plan/subscription) with a monthly credit pool. Use the `mimo-token` template for that account type:

```sh
claude-multi add mimo-token
```

Token Plan runs on regional endpoints. The template defaults to China. After setup, replace `ANTHROPIC_BASE_URL` with the endpoint shown in your subscription console:

| Region | Base URL |
|--------|----------|
| China | `https://token-plan-cn.xiaomimimo.com/anthropic` |
| Singapore | `https://token-plan-sgp.xiaomimimo.com/anthropic` |
| Europe | `https://token-plan-ams.xiaomimimo.com/anthropic` |

The Token Plan key is separate from a pay-as-you-go key, and the quota covers `mimo-v2.6-pro` and `mimo-v2.6-flash`. Individual plans start at $6/month for Lite. The plan is limited to coding tools, not automated scripts or application backends, so check the terms before pointing a production service at it.

## Where it fits

MiMo is the low-cost multimodal option. If your agent needs to read screenshots, watch a screen recording, or take audio input, V2.6 Pro handles it in the same 1M window as the text context. Flash does the same for less when the task is routine.

The 128K output ceiling matches what Claude Code allows for an unrecognized model ID. DeepSeek and MiniMax list larger model maximums, but the client caps output at 128,000 either way, so the practical ceiling is the same.

Use the standard API for bursty work and the Token Plan when your monthly usage is predictable. The model IDs are the same on both, so switching plans does not require a new config beyond the base URL and key.

## Related providers

- [DeepSeek](/providers/deepseek/) - also pay-per-token, 1M context, 384K output
- [Kimi](/providers/kimi/) - 1M context on K3.1 Pro, built for tool use
- [MiniMax](/providers/minimax/) - same 1M context, 512K output
