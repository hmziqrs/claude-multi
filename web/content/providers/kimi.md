---
title: "Moonshot Kimi K3.1 Pro Provider for Claude Code"
description: "Run Claude Code with Kimi K3.1 Pro in every slot. 1M context, always-on thinking, pay-per-token pricing, and the K2 retirement timeline."
provider: "kimi"
tagline: "One model for every slot, 1M context"
setupCommand: "claude-multi add kimi"
useCases:
  - "Agentic coding with complex tool chains"
  - "Multi-step debugging and investigation"
  - "Long-context repository work"
  - "API integration and glue code"
pricing: "Pay-per-token via platform.kimi.ai"
order: 5
updated: 2026-11-03
---

[Kimi K3.1 Pro](https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart) is Moonshot's current flagship: 1M token context, vision input, tool calling, and thinking that cannot be turned off. K2.7 Code is the older coding specialist with a 256K window and closed to new users on October 31, 2026. Both connect through the Anthropic-compatible endpoint at `api.moonshot.ai/anthropic`.

## Model specs

| Role | Model | Context | Max output |
|------|-------|---------|------------|
| Primary, opus, sonnet, fable, haiku, subagents | `kimi-k3.1-pro[1m]` | 1M | 131K default, up to 1M |
| Optional faster variant | `kimi-k3.1-pro-highspeed[1m]` | 1M | 131K default, up to 1M |
| Legacy | `kimi-k2.7-code` | 256K | 32K default |
| Legacy | `kimi-k2.6` | 256K | 32K default |
| Retired | `kimi-k2.5` | 256K | n/a |

K3.1 Pro Highspeed runs the same model 2 to 3 times faster at double the token price. It is optional. The template uses standard speed in every slot, including haiku and subagents, because the fast slots do not need the extra cost.

K3.1 Pro always thinks. `reasoning_effort` accepts `low`, `high`, and `max`, and defaults to `max`. The template sets `max`, adds `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1`, and uses `MAX_THINKING_TOKENS=16000` as a client-side hint.

K2.7 Code does not support non-thinking mode and fixes temperature at 1.0. It remains available to existing users during the K2 retirement window.

## Template status: current

The 0.13.2 template ships `kimi-k3.1-pro[1m]` for primary, opus, sonnet, fable, haiku, and subagents. It sets `CLAUDE_CODE_AUTO_COMPACT_WINDOW` to 1000000, `CLAUDE_CODE_MAX_OUTPUT_TOKENS` to 128000, `CLAUDE_CODE_EFFORT_LEVEL` to `max`, `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT` to `1`, and `MAX_THINKING_TOKENS` to 16000. No manual override is needed for a new instance.

Kimi always thinks and has no thinking-budget parameter, so `MAX_THINKING_TOKENS` is a client-side hint; reasoning depth follows the effort level.

The 1M compaction window matches the model window. Claude Code caps output at 128,000 for an unrecognized model ID, so the template's 128000 output setting is the effective ceiling even though K3.1 Pro accepts more.

## Upgrading from K2

If you created a Kimi instance before October 2026, its settings still name K2 models. Run:

```sh
claude-multi doctor check
claude-multi doctor fix
```

The sync moves every slot to K3.1 Pro at standard speed, sets the compaction window to 1M, and updates the output and thinking settings. New instances get the same mapping at setup.

Do not mix K3.1 Pro with a K2 model in the same instance. Claude Code applies one compaction window, so the 1M setting will let a 256K K2 model overflow. If you still have K2 access and want the cheaper coding model, set `kimi-k2.7-code` for opus and `kimi-k2.6` for every other slot, including fable, haiku, and subagents, then keep `CLAUDE_CODE_AUTO_COMPACT_WINDOW` at `262144`.

## Setup

1. Create an account at [platform.kimi.ai](https://platform.kimi.ai) and generate an API key
2. Run the setup command:

```sh
claude-multi add kimi
```

3. Paste your API key when prompted

K3.1 Pro requires a top-up of at least $1. Your cumulative top-up also sets your rate limits.

## Pricing details

Kimi bills per token, with no subscription on the API. Cache reads are much cheaper than fresh input.

| Model | Input / 1M | Output / 1M | Cache read / 1M |
|-------|-----------|-------------|-----------------|
| `kimi-k3.1-pro` | $2.00 | $10.00 | $0.20 |
| `kimi-k3.1-pro-highspeed` | $4.00 | $20.00 | $0.20 |
| `kimi-k2.7-code` | $0.95 | $4.00 | $0.19 |

Highspeed doubles the input and output rates. Use it only when response latency matters more than cost, and keep standard speed for haiku and subagents. The template already does this.

K2.7 Code costs about half as much as K3.1 Pro on input and 40% as much on output. That gap is why the K2 retirement matters: the cheap coding tier goes away, and K3.1 Pro becomes the default at every slot.

K3 models bill cache writes separately by TTL. The default is 5 minutes; a 1-hour cache costs more per write but survives longer gaps between requests. K3.1 Pro and K3 also support the Batch API at 60% of the standard rate for jobs that can wait.

[Kimi's pricing page](https://platform.kimi.ai/docs/pricing/chat) has the current per-model table and cache rates.

## The K2 shutdown

K2.5 was [retired across the platform](https://platform.kimi.ai/docs/models) on August 31, 2026. K2.6 and K2.7 remain served to existing users. K2 series models closed to new users on October 31, 2026, and Moonshot plans to retire all K2 models by the end of December 2026.

If you created an instance before October, check which model IDs it uses. The 0.12.x template put K2.7 Code in the opus slot and K2.6 and K2.5 in the lower slots. K2.5 already returns an error, and the other two stopped working for new accounts after October 31. Run `claude-multi doctor fix` to move the instance to K3.1 Pro. A new account should skip K2 entirely.

## Where it fits

Kimi is strongest in tool-heavy loops: reading files, running commands, and editing in sequence. K2.7 Code was built for that pattern, and K3.1 Pro keeps the tool behavior while adding a 1M window and stronger long-horizon planning.

K3.1 Pro is the default in every slot. Highspeed is optional for latency-sensitive work, but it costs double, so it is not the shipped choice. For a cheaper 1M-context option, [DeepSeek](/providers/deepseek/) and [MiMo](/providers/mimo/) cost less per token.

## Related providers

- [DeepSeek](/providers/deepseek/) - 1M context, lower cost per token
- [MiMo](/providers/mimo/) - 1M context, cheaper flash tier
- [GLM](/providers/glm/) - subscription alternative
