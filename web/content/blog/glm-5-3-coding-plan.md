---
title: "GLM-5.3 for Claude Code: Post-Training Gains and a Two-Model Mapping"
description: "GLM-5.3 landed on the Z.ai Coding Plan on 2026-08-14. The claude-multi GLM template now runs it in both the opus and sonnet slots at 1M context, with 128K max output and the new points-based quota."
date: 2026-08-14
tags: [providers, models, glm, benchmark, claude-code]
---

Z.ai released GLM-5.3 today, and the claude-multi GLM template moves to it in version 0.11.0. It is the same base model as GLM-5.2 (every gain comes from post-training) and it is text-in/text-out like its predecessor. The template now runs `glm-5.3[1m]` in both the opus and sonnet slots, keeps `glm-5-turbo` for haiku, and raises the output cap to 128K.

The opus/sonnet merge is the part that needs explaining. As of this release, `glm-5.2` and `glm-5.1` are no longer served on the GLM Coding Plan endpoint: requests for them are automatically routed to `glm-5.3`. Z.ai's own Claude Code example maps both the sonnet and opus slots to `glm-5.3[1m]`. The distinct middle tier from 0.10.0 is gone, and this post reverses that stance: there is no separate sonnet-tier model to point at anymore.

_Update (2026-08-26): claude-multi v0.12.0 moves the sonnet slot to `glm-5.3-flash[1m]`._

## The new mapping

| Role | 0.10.0 model | 0.11.0 model |
|---|---|---|
| Opus | GLM-5.2[1m] | GLM-5.3[1m] |
| Sonnet | GLM-5.1 | GLM-5.3[1m] |
| Haiku | GLM-5-Turbo | GLM-5-Turbo |

Thinking stays on, but it is no longer optional. GLM-5.3 rejects `thinking.type: "disabled"` outright; `reasoning_effort` accepts low, high, or max, defaults to max, and Z.ai recommends max for coding. The template keeps `REASONING_EFFORT` at high with 8,000 thinking tokens, unchanged from 0.10.0; thinking bills as output at the 24x multiplier, so max is a quota call as much as a quality one.

Haiku stays on GLM-5-Turbo. Z.ai's example maps its haiku slot to `glm-4.7`, which is still served natively on the plan, but the template keeps the turbo model: it is a 200K-context model, which is exactly what Claude Code assumes for any model it does not recognize, so compaction lines up with the real limit on its own. That is also why the template still sets no global `CLAUDE_CODE_AUTO_COMPACT_WINDOW`, even though Z.ai's example pins it to 1000000. The instance mixes a 1M model with a 200K model; the `[1m]` suffix carries the window per model, and one global number cannot fit both.

## Context windows and max output

The context story is unchanged from GLM-5.2. The `[1m]` suffix opts into the 1,000,000-token window; unsuffixed `glm-5.3` defaults to roughly 200K. What did change is output: both `glm-5.3` and `glm-5-turbo` support a documented max of 128K output tokens, so the template's `MAX_OUTPUT_TOKENS` goes from 64000 to 128000. The endpoint stays at `https://api.z.ai/api/anthropic`.

## Benchmarks against GLM-5.2

Here is the honest part, same rules as last time: every number below is vendor-published from Z.ai's own announcement tables, and the comparison labels are theirs. There is no SWE-bench Verified score for GLM-5.3, so this is what we have.

| Benchmark | GLM-5.2 | GLM-5.3 |
|---|---|---|
| Terminal-Bench 2.1 | 81.0 | 88.2 |
| Terminal-Bench 3.0 | 4.6 | 28.3 |
| DeepSWE v1.1 | 46.2 | 66.9 |
| NL2Repo | 48.9 | 58.0 |
| FrontierSWE | 67.5 | 78.1 |
| SWE-Marathon v1.1 | 19.4 | 42.5 |
| PostTrainBench | 31.7 | 39.8 |

On Z.ai's own Code Bench, GLM-5.3 completed 34.5% of tasks at roughly 75K output tokens, against GLM-5.2's 23.4% at roughly 96K. That is about a 50% jump, and it got there on fewer output tokens. At High effort it posted 31.4% at ~50K tokens, ahead of Claude Opus 4.8's 29.5% at ~120K, but behind Fable 5 at 39.5%. That is the shape of this release: big moves on terminal and long-horizon work, not the top of every table.

| Benchmark | GLM-5.2 | GLM-5.3 |
|---|---|---|
| ALE-CLI | 23.8 | 28.5 |
| HLE with Tools | 54.7 | 62.5 |
| AutomationBench v1.0.6 | 26.2 | 48.2 |
| Toolathlon Verified | 59.9 | 73.0 |
| GDPval-AA v2 | 1508 | 1769 |
| CyberGym | 77.2 | 84.5 |
| ExploitBench | 24.4 | 54.4 |
| ExploitGym 2h / 6h | 29 / 39 | 105 / 130 |

Z.ai claims open-source SOTA on Terminal-Bench 3.0 and ALE-CLI, and overall SOTA on CyberGym. The exploit numbers more than doubled. Remember the baseline, though: this is the same base model as GLM-5.2, so all of it is post-training, and none of it is independently verified.

## The new points-based pricing

The Coding Plan also switched how it meters usage. The old 3x-peak / 2x-off-peak multiplier model was discontinued for new users on 2026-07-30, and the plan now runs on credits: `credits = (input x input_mult + cached_input x cached_mult + output x output_mult) / 10,000`.

| Model | Input mult | Cached mult | Output mult |
|---|---|---|---|
| GLM-5.3 | 6.9 | 1.7 | 24 |
| GLM-5-Turbo | 5.7 | 1.5 | 21 |
| GLM-4.7 | 4.6 | 1.2 | 16 |
| GLM-4.6V (vision MCP tools only) | 1.2 | 0.3 | 2.7 |

| Plan | Credits per 5h | Credits per week |
|---|---|---|
| Lite | 2,000 | 10,000 |
| Pro | 12,000 | 60,000 |
| Max | 28,000 | 140,000 |

Off-peak usage costs 50% of the standard credit rate, and peak is a narrow window: Monday to Friday, 14:00-18:00 UTC+8. Nights, weekends, and weekday mornings are all off-peak. Pricing starts from $18 USD/month for Lite, with quarterly billing 20% off and yearly 30% off; check the plan page for current Pro and Max prices, since those tiers are not confirmed here.

## Availability and existing instances

At launch, GLM-5.3 is available on the GLM Coding Plan and ZCode only. The general pay-as-you-go API is listed as coming soon, and open weights are expected about two weeks after launch, pending safety evals.

If you already have a GLM instance, nothing breaks today: the endpoint auto-routes the old `glm-5.2` and `glm-5.1` ids to `glm-5.3`, so existing configs keep working. But your env still names the old models and caps output at 64000, so run `claude-multi doctor fix` to sync the new template. The sync preserves your API key and any custom env vars.

## Getting started

```sh
claude-multi add glm
```

Paste your Z.ai API key when prompted. The template fills in the endpoint, the two model mappings, thinking, and the new output cap. The instance is ready to go immediately.

---

See the [GLM provider page](/providers/glm/) for the full spec table, the [GLM-5.2 post](/blog/glm-5-2-three-tier-coding-plan/) for how the three-tier mapping used to look, or compare against [Kimi K2.7](/blog/kimi-k27-three-tier-agentic-coding/) and [MiniMax M3](/blog/minimax-m3-one-million-context-frontier-coding/). The [CHANGELOG](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md) has the full diff.
