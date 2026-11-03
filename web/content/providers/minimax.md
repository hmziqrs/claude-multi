---
title: "MiniMax M3.1 Flash Provider for Claude Code"
description: "Run Claude Code with MiniMax-M3.1-Flash in every slot. 1M context, 128K output in Claude Code, always-on thinking, multimodal input, flat pricing."
provider: "minimax"
tagline: "1M context, one model for every slot"
setupCommand: "claude-multi add minimax"
useCases:
  - "Holding a large codebase in a single context"
  - "Full repository refactoring and migration"
  - "Long-running agentic tasks with extended tool chains"
  - "Multimodal coding with image understanding"
pricing: "Pay-per-token via minimax.io"
order: 2
updated: 2026-11-03
---

MiniMax-M3.1-Flash is MiniMax's current model for Claude Code, [released October 19, 2026](https://www.minimax.io/blog/minimax-m31f). It has a 1M token context window, a 524,288 token output ceiling, and thinking that is always on. M3 is the previous generation and remains available. MiniMax says a Pro model will follow, but it has not published an ID or date, so the template does not list one.

## Model specs

| Role | Model | Context | Max output |
|------|-------|---------|------------|
| Primary, opus, sonnet, fable, haiku, subagents | `MiniMax-M3.1-Flash[1m]` | 1M | 512K, 128K recommended |
| Previous generation | `MiniMax-M3` | 1M | 512K |

The template maps M3.1 Flash to every role, including subagents. There is one model in the shipped config, so quick shell commands and complex multi-step reasoning both go to M3.1 Flash.

M3.1 Flash takes text, images, and video as input. Thinking cannot be disabled. The effort setting accepts `low`, `medium`, `high`, `xhigh`, and `max`, and defaults to `max`. M3 also takes text, images, and video, but thinking is off when the `thinking` field is omitted. Send `adaptive` to enable it.

MiniMax positions M3.1 Flash as its current Flash model for agentic coding. M3 remains on the model list for existing workloads, and MiniMax states that a Pro model will arrive later.

## Template status

The 0.13.2 template pins `MiniMax-M3.1-Flash[1m]` in primary, opus, sonnet, fable, haiku, and subagent slots. It sets `CLAUDE_CODE_AUTO_COMPACT_WINDOW` to 524288, `CLAUDE_CODE_EFFORT_LEVEL` to `max`, `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT` to `1`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS` to 128000, `API_TIMEOUT_MS` to 3000000, and disables nonessential traffic. No manual edit is needed.

MiniMax's [Claude Code guide](https://platform.minimax.io/docs/m-plan/claude-code) uses the same model name in every role, the same 524288 compaction window, and effort `max`. The template follows that setup and adds the Fable and subagent slots.

To use M3 instead, change the model IDs in `~/.claude-<name>/settings.json` to `MiniMax-M3[1m]` and keep the 524288 window. The Pro model is not available yet, so there is no ID to set.

## Setup

1. Create an account at [minimax.io](https://minimax.io) and generate an API key
2. Run the setup command:

```sh
claude-multi add minimax
```

3. Paste your API key when prompted

The template writes the base URL, model mapping, effort level, and output limit.

## Pricing details

MiniMax bills per token through [minimax.io](https://minimax.io) with no monthly commitment. The [MiniMax pricing page](https://platform.minimax.io/docs/pricing/overview) lists the current rates:

| Tier | Input / 1M | Output / 1M | Cache read / 1M |
|------|-----------|-------------|-----------------|
| M3.1 Flash, flat rate | $0.15 | $0.60 | $0.015 |
| M3, up to 512K input | $0.30 | $1.20 | $0.06 |
| M3, above 512K input | $0.60 | $2.40 | $0.12 |

M3.1 Flash uses one flat rate at every input length. M3 keeps the older two-band price, with a higher rate above 512K input tokens. MiniMax lists the M3 figures as a permanent 50% discount from the earlier $0.60/$2.40 and $1.20/$4.80 list prices.

Priority service is available on M3 at 1.5x the standard rate. Set `service_tier` to `priority` for priority admission. M3.1 Flash does not support the `service_tier` field.

MiniMax also sells M Plan subscriptions for individuals. Both routes use `api.minimax.io`; the key type decides which quota is consumed.

For benchmark comparisons against Opus 4.7 and GPT-5.5, see the [MiniMax M3 announcement post](/blog/minimax-m3-one-million-context-frontier-coding/).

## Where it fits

MiniMax fits when context length is the constraint. The 1M window means fewer compaction cycles on a large repository. The model accepts up to 512K output, though Claude Code caps a single response at 128K.

M3.1 Flash is half the base M3 input and output rate, with the same 1M context and output ceiling. MiniMax reports that it cuts overall usage cost by 70% on agentic tasks compared with its predecessor. The launch post also shows higher scores on DeepSWE v1.1, AutomationBench, and OSWorld V2. Public aggregate indexes place M3.1 Flash above M3. Those are vendor and aggregate results, not a coding head-to-head, so test on your own tasks before moving a workload.

Claude Code caps output at 128,000 tokens for an unrecognized model ID, so the practical output ceiling is 128K in this template even though the model accepts more.

If your sessions stay under 128K, MiMo V2.6 Flash is cheaper on output, and DeepSeek Flash matches the M3.1 Flash off-peak input and output rates.

## Related providers

- [DeepSeek](/providers/deepseek/) - 1M context, pay-per-token, off-peak discounts
- [GLM](/providers/glm/) - fixed monthly subscription plan
- [Kimi](/providers/kimi/) - 1M context on K3.1 Pro, built for tool-heavy work
