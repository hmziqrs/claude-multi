---
title: "GLM-5.3 for Claude Code: the two-model mapping"
description: "The claude-multi GLM template maps glm-5.3 to primary, opus, and sonnet, and glm-5.3-flash to haiku. Setup, credits, and vendor benchmarks."
date: 2026-08-14
updated: 2026-10-31
tags: [providers, models, glm, benchmark, claude-code]
---

Z.ai released GLM-5.3 on 2026-08-14. It uses the same base model as GLM-5.2, and Z.ai says every gain comes from post-training. It takes text in and returns text out. GLM-5.3-Flash, released on 2026-08-26, is the multimodal member of the family.

The claude-multi GLM template is now two models. Version 0.13.0 maps `glm-5.3[1m]` to primary, opus, and sonnet, and `glm-5.3-flash[1m]` to haiku. That is the mapping in Z.ai's Claude Code example. Version 0.11.0 put GLM-5.3 in both the opus and sonnet slots. Version 0.12.0 moved sonnet to Flash. Version 0.13.0 moved Flash to haiku and returned GLM-5.3 to sonnet.

| Role | 0.13.0 model | Context |
|---|---|---|
| Primary, opus, sonnet | `glm-5.3[1m]` | 1M |
| Haiku | `glm-5.3-flash[1m]` | 1M |

Z.ai no longer serves `glm-5.2` or `glm-5.1` on the Coding Plan endpoint. Requests for either ID route to `glm-5.3`. Requests for `glm-4.7` route to `glm-5.3-flash`. The plan lists GLM-5.3 and GLM-5.3-Flash as its models, so those are the only two IDs the template needs.

The details are in [Z.ai's GLM-5.3 announcement](https://z.ai/blog/glm-5.3), the [GLM-5.3 docs](https://docs.z.ai/guides/llm/glm-5.3), and the [GLM-5.3-Flash announcement](https://z.ai/blog/glm-5.3-flash).

## What changes in the template

The output cap stays at 128,000 tokens, up from 64,000 in 0.10.0. Z.ai documents 128K max output for GLM-5.3 and GLM-5.3-Flash, and the template sets `CLAUDE_CODE_MAX_OUTPUT_TOKENS` to 128000. The endpoint stays at `https://api.z.ai/api/anthropic`.

The haiku slot gets Flash. Z.ai says Flash carries three times the plan quota of GLM-5.3 and accepts image input, which matters for the short calls and subagents that read screenshots. Primary, opus, and sonnet run on GLM-5.3 for long refactors and hard debugging.

Thinking stays on, and it is no longer optional. GLM-5.3 rejects `thinking.type: "disabled"`. `reasoning_effort` accepts `low`, `high`, or `max`, defaults to `max`, and Z.ai recommends `max` for coding. The template sets `CLAUDE_CODE_EFFORT_LEVEL` to `high` with 8,000 thinking tokens. Thinking bills as output at the 24x multiplier, so `max` is a quota decision as much as a quality one.

Context is simpler now. Both models support 1M, so the template adds the `[1m]` suffix to both and sets `CLAUDE_CODE_AUTO_COMPACT_WINDOW` to 1000000. Unsuffixed `glm-5.3` defaults to roughly 200K in Claude Code. One global window fits both slots.

If you already have a GLM instance, run `claude-multi doctor fix` to sync the new template. It preserves your API key and any custom env vars.

## Credits and plans

The Coding Plan meters usage in credits:

`credits = (input x input_mult + cached_input x cached_mult + output x output_mult) / 10,000`

| Model | Input mult | Cached mult | Output mult |
|---|---|---|---|
| GLM-5.3 | 6.9 | 1.7 | 24 |
| GLM-5.3-Flash | 2.3 | 0.56 | 8 |

Z.ai's table lists these two models. Older IDs do not have their own line: `glm-5.2` and `glm-5.1` route to GLM-5.3, and `glm-4.7` routes to Flash.

GLM-5.3 consumes exactly three times the credits of Flash: 6.9 against 2.3 on input and 24 against 8 on output. Flash also carries three times the plan quota, so the two effects compound if you use it for everyday work.

| Plan | Credits per 5h | Credits per week |
|---|---|---|
| Lite | 2,000 | 10,000 |
| Pro | 12,000 | 60,000 |
| Max | 28,000 | 140,000 |

Off-peak calls cost 50% of the standard credit rate. Peak is Monday to Friday, 14:00-18:00 UTC+8. Nights, weekends, and weekday mornings are off-peak. Plans start at $18 per month for Lite, with 20% off quarterly billing and 30% off yearly billing. Z.ai has the current Pro and Max prices on its [plan page](https://z.ai/subscribe).

This credit system replaced the older peak/off-peak multiplier plan, which Z.ai discontinued for new users on 2026-07-30. The [plan update notice](https://docs.z.ai/devpack/notice/usage-revision) has the migration details.

## Benchmarks

Every number below is vendor-published from Z.ai's announcement tables. The comparison labels are Z.ai's. There is no SWE-bench Verified score for GLM-5.3 in the announcement, so this is the available data, not an independent result.

| Benchmark | GLM-5.2 | GLM-5.3 |
|---|---|---|
| Terminal-Bench 2.1 | 81.0 | 88.2 |
| Terminal-Bench 3.0 | 4.6 | 28.3 |
| DeepSWE v1.1 | 46.2 | 66.9 |
| NL2Repo | 48.9 | 58.0 |
| FrontierSWE | 67.5 | 78.1 |
| SWE-Marathon v1.1 | 19.4 | 42.5 |
| PostTrainBench | 31.7 | 39.8 |
| ALE-CLI | 23.8 | 28.5 |
| HLE with Tools | 54.7 | 62.5 |
| AutomationBench v1.0.6 | 26.2 | 48.2 |
| Toolathlon Verified | 59.9 | 73.0 |
| GDPval-AA v2 | 1508 | 1769 |
| CyberGym | 77.2 | 84.5 |
| ExploitBench | 24.4 | 54.4 |
| ExploitGym 2h / 6h | 29 / 39 | 105 / 130 |

On Z.ai's in-house Code Bench, GLM-5.3 completed 34.5% of tasks at roughly 75K output tokens per task, against GLM-5.2's 23.4% at roughly 96K. At High effort it posted 31.4% at about 50K tokens, ahead of Claude Opus 4.8's 29.5% at about 120K. It is still behind Claude Fable 5, which reaches 39.5% at Max effort. Z.ai claims open-source SOTA on Terminal-Bench 3.0 and ALE-CLI, and the best result on CyberGym.

The baseline matters. GLM-5.3 shares its base model with GLM-5.2, so all of this comes from post-training, and none of it is independently verified.

## Availability and upgrades

At launch, GLM-5.3 was available on the Coding Plan and ZCode only. The pay-as-you-go API followed, and Z.ai now lists GLM-5.3 on its [model API](https://z.ai/model-api). claude-multi uses the Coding Plan endpoint.

If you have an older instance, nothing breaks today: the endpoint routes `glm-5.2` and `glm-5.1` to `glm-5.3`. But your env may still name the old models and cap output at 64000. Run `claude-multi doctor fix` to sync the current template and get Flash in the haiku slot.

## Getting started

```sh
claude-multi add glm
```

Paste your Z.ai API key when prompted. The template fills in the endpoint, the two model mappings, thinking, and the 128K output cap. The instance is ready.

---

See the [GLM provider page](/providers/glm/) for the full spec table, the [GLM-5.2 post](/blog/glm-5-2-three-tier-coding-plan/) for the older mapping, or compare against [Kimi K3.1 Pro](/blog/kimi-k27-three-tier-agentic-coding/) and [MiniMax M3.1 Flash](/blog/minimax-m3-one-million-context-frontier-coding/). The [CHANGELOG](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md) has the full diff.
