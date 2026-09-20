---
title: "GLM-5.2 for Claude Code: 1M Context and Three-Tier Model Mapping"
description: "GLM-5.2 brings a 1,000,000-token context window to the Z.ai Coding Plan. The claude-multi GLM template now maps it to the opus slot, with GLM-5.1 as sonnet and GLM-5-Turbo as haiku."
date: 2026-06-13
tags: [providers, models, glm, benchmark, claude-code]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/glm-5-2-three-tier-coding-plan.mp3"
---

Z.ai's Coding Plan now runs GLM-5.2 as its opus-tier model, and it comes with a 1,000,000-token context window. The claude-multi GLM template now spreads three distinct GLM models across Claude Code's three tiers for the first time: GLM-5.2 for opus, GLM-5.1 for sonnet, and GLM-5-Turbo for haiku.

The old template did not really have a middle tier. It put GLM-5.1 in the opus slot and reused GLM-5-Turbo for both sonnet and haiku, so there was no model between "fast" and "frontier." This update gives each tier its own model, which means a real capability and speed gradient from top to bottom.

## The three-tier mapping

| Claude Code tier | GLM model | Context window | Role |
|---|---|---|---|
| Opus | GLM-5.2 | 1M | Long, hard, multi-file work |
| Sonnet | GLM-5.1 | 200K | Day-to-day coding |
| Haiku | GLM-5-Turbo | 200K | Quick edits, shell, subagents |

Thinking stays on. The template keeps `REASONING_EFFORT` at high with 8,000 thinking tokens, which is enough for most code work without eating the context budget.

## Context windows and the 1M variant

GLM-5.2's million-token window is not the default. You opt into it with a `[1m]` suffix on the model name: `glm-5.2[1m]`. Claude Code reads that suffix and compacts around 75% of one million tokens instead of its usual 200K assumption. DeepSeek and MiMo use the same convention.

GLM-5.1 and GLM-5-Turbo are 200K models. They do not need a suffix, because 200K is exactly what Claude Code assumes for any model it does not recognize. Their compaction window lines up with their real limit on its own.

That is why the template no longer sets a global compaction override. The previous template pinned `CLAUDE_CODE_AUTO_COMPACT_WINDOW` to 131072 (128K), because the earlier GLM-5.1 was a 128K model sitting below Claude Code's 200K default. Without the pin, the conversation would sail past 128K and the API call would crash. None of the three current models have that problem. A single global number cannot fit a 1M model and two 200K models at the same time, so the template lets each model carry its own size.

## GLM-5 family benchmarks

Here is the honest part. Z.ai has not published benchmark numbers for GLM-5.2. It is positioned in the Coding Plan as the opus-tier model and the successor to GLM-5.1, but there is no SWE-bench or reasoning table for it yet.

The closest fully documented flagship is GLM-5.1, which Z.ai describes as aligned with Claude Opus 4.6 and able to run unattended for up to eight hours. Its published scores are the best available read on where the family sits. Every number below comes from Z.ai's own tables, and the competitor labels are theirs.

| Benchmark | GLM-5.1 | Closest competitor (Z.ai's table) |
|---|---|---|
| SWE-Bench Pro | 58.4 | GPT-5.4, 57.7 |
| NL2Repo | 42.7 | Claude Opus 4.6, 40.1 |

GLM-5.1 also posted 95.3 on AIME 2026, 86.2 on GPQA-Diamond, and 63.5 on Terminal-Bench 2.0, with no competitor figures published alongside them.

The generation before that, GLM-5, is a 744-billion-parameter Mixture-of-Experts model with 40 billion active parameters, trained on 28.5 trillion tokens. It scored 77.8 on SWE-bench Verified, a hair behind Claude Opus 4.5 at 78.0 and ahead of Kimi K2.5 at 76.2. So the lineage that GLM-5.2 extends has been trading blows with the frontier for a while.

## Coding Plan pricing

The GLM models reach Claude Code through Z.ai's Coding Plan, a monthly subscription. The Anthropic-compatible endpoint at `api.z.ai/api/anthropic` is gated to the plan. There is no pay-per-token Anthropic URL for GLM.

| Plan | Price per month | Usage |
|---|---|---|
| Lite | $18 | 1x baseline |
| Pro | $72 | ~5x |
| Max | $160 | ~20x |

Quota runs on a rolling five-hour window plus a weekly cap. Opus-tier models, which includes GLM-5.2, GLM-5.1, and GLM-5-Turbo, count at 3x during peak hours and 2x off-peak. A limited promo drops that to 1x off-peak through the end of September.

If you would rather pay by the token, GLM-5-Turbo is on the standard API at $1.20 per million input tokens and $4.00 per million output. That route does not go through the Anthropic endpoint, so it is not what claude-multi uses, but it is useful to know the floor price exists.

## When to pick GLM

Pick the GLM template when you want a fixed monthly bill and a genuine three-tier spread. GLM-5.2 gives you the long context for big refactors and long sessions, GLM-5.1 handles the bulk of everyday coding, and GLM-5-Turbo keeps the small, fast tasks cheap and quick.

If your usage is bursty and you prefer to pay only for what you run, the DeepSeek or MiMo pay-per-token templates fit better. They expose their own frontier models without a subscription.

## Getting started

```sh
claude-multi add glm
```

Paste your Z.ai API key when prompted. The template fills in the endpoint, the three model mappings, and the context handling. The instance is ready to go immediately.

---

See the [GLM provider page](/providers/glm/) for the full spec table, or compare this against [Kimi K2.7](/blog/kimi-k27-three-tier-agentic-coding/) and [MiniMax M3](/blog/minimax-m3-one-million-context-frontier-coding/). The [CHANGELOG](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md) has the full diff.
