---
title: "GLM-5.2's three-tier mapping, and why it ended"
description: "How the GLM-5.2 template split opus, sonnet, and haiku across three models, why GLM-5.3 collapsed it, and the two-model mapping that replaced it."
date: 2026-06-13
updated: 2026-10-31
tags: [providers, models, glm, benchmark, claude-code]
---

> **Superseded by GLM-5.3.** This post documents the June 2026 GLM-5.2 template. The current template maps `glm-5.3[1m]` to primary, opus, and sonnet, and `glm-5.3-flash[1m]` to haiku. See the [GLM-5.3 post](/blog/glm-5-3-coding-plan/) for the current setup.

GLM-5.2 arrived on the Coding Plan in June 2026 with a 1,000,000-token context window. For a few weeks, claude-multi had a real three-tier spread: GLM-5.2 for opus, GLM-5.1 for sonnet, and GLM-5-Turbo for haiku. It was the first time each Claude Code tier got a different GLM model.

## The mapping at 5.2 launch

| Claude Code tier | GLM model | Context window | Role |
|---|---|---|---|
| Opus | GLM-5.2 | 1M | Long, hard, multi-file work |
| Sonnet | GLM-5.1 | 200K | Day-to-day coding |
| Haiku | GLM-5-Turbo | 200K | Quick edits, shell, subagents |

Thinking stayed on at high with 8,000 thinking tokens. The 1M window came from the `[1m]` suffix on GLM-5.2. GLM-5.1 and GLM-5-Turbo were 200K models, so they matched Claude Code's default assumption and needed no suffix.

GLM-5-Turbo was the old template choice for the haiku slot. It is not a Coding Plan model, and the current template does not use it.

## Why 5.3 collapsed it

Z.ai released GLM-5.3 on 2026-08-14 and stopped serving 5.2 and 5.1 on the Coding Plan endpoint. Requests for either ID route to 5.3. claude-multi v0.11.0 put 5.3 in both the opus and sonnet slots, so the middle tier disappeared. On 2026-08-26, v0.12.0 moved sonnet to GLM-5.3-Flash. Version 0.13.0 moved Flash to haiku and returned GLM-5.3 to sonnet. The current template has two models, not the three this post describes.

The sources are [Z.ai's GLM-5.3 announcement](https://z.ai/blog/glm-5.3) and the [GLM-5.3-Flash announcement](https://z.ai/blog/glm-5.3-flash).

## Current mapping

| Claude Code tier | GLM model | Context window |
|---|---|---|
| Primary, opus | `glm-5.3[1m]` | 1M |
| Sonnet | `glm-5.3[1m]` | 1M |
| Haiku | `glm-5.3-flash[1m]` | 1M |

The two top slots share GLM-5.3. Flash carries three times the plan quota of GLM-5.3 and accepts image input, so it fits the frequent, short calls in the haiku slot. The full spec is on the [GLM provider page](/providers/glm/).

## What to do with an old instance

Do not follow the setup instructions from the original version of this post. They describe a template that no longer ships. If you created a GLM instance on 0.10.0, 0.11.0, or 0.12.0, run:

```sh
claude-multi doctor fix
```

The sync rewrites the model IDs, the compaction window, and the output cap, and it preserves your API key and any custom env vars. The old `glm-5.2` and `glm-5.1` IDs still route to 5.3, so a stale instance will not fail immediately. A 0.10.0 instance keeps the old 64,000 output cap. A 0.11.0 instance has the new cap but still points sonnet at 5.3. A 0.12.0 instance has Flash in sonnet and needs the haiku slot moved to Flash.

The original post also described the 3x peak / 2x off-peak quota and a promo through September 2026. Z.ai discontinued that system for new users on 2026-07-30 and moved the plan to credits. The [GLM-5.3 post](/blog/glm-5-3-coding-plan/) has the current formula and plan limits.

## What still applies

The mechanics did not change. The `[1m]` suffix opts a model into the million-token window, and Claude Code compacts around the window it reads from the model name. That was true for GLM-5.2, and it is true for GLM-5.3 and Flash. When the tiers had different windows, the template had to set context per model. Both current models are 1M, so 0.13.0 uses one global window at 1000000.

---

See the [GLM provider page](/providers/glm/) for the current spec table, or compare against [Kimi K3.1 Pro](/blog/kimi-k27-three-tier-agentic-coding/) and [MiniMax M3.1 Flash](/blog/minimax-m3-one-million-context-frontier-coding/). The [CHANGELOG](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md) has the full diff.
