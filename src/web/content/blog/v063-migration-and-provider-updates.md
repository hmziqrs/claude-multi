---
title: "v0.6.3: Drop the Pinned Binary, Update Every Provider Template"
description: "Instance migrations now point wrappers at your global claude install instead of a stale pinned binary. Every provider template got correct thinking and output token limits."
date: 2026-05-29
tags: [release, migration, providers, templates]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/v063-migration-and-provider-updates.mp3"
---

# v0.6.3: Drop the Pinned Binary, Update Every Provider Template

Two things in this release: moving away from the pinned Claude Code binary, and bringing every provider template up to date with correct thinking and output token limits.

## No more pinned binary

Every claude-multi wrapper script used to point at a pinned Claude Code binary living at `~/.claude-multi/bin/`. That was the right call during the v2.1.154 incident, when we needed to lock everyone to v2.1.153 to avoid the third-party provider breakage. But the incident is over. Claude Code v2.1.156 fixed it, and pinning a binary nobody remembers to update just means your instances fall behind.

I ran into this myself after the 0.6.2 release. The migration had run, the wrapper templates looked correct, but my instances were still executing v2.1.153 because the pinned binary had never been updated. The wrappers were pointing at the right file. The file was just the wrong version.

Starting with 0.6.3, instance migrations regenerate wrappers to point at your globally installed `claude`, the one `which claude` finds on your PATH. The migration checks whether the wrapper content actually differs before writing anything, so instances that are already correct don't get touched.

If you set `CLAUDE_MULTI_CLAUDE_PATH`, that still takes priority over everything else.

## Provider templates: thinking and output tokens

Every provider template now has explicit `MAX_THINKING_TOKENS`, `MAX_OUTPUT_TOKENS`, `ENABLE_THINKING`, and `REASONING_EFFORT` values matched to what each model actually supports. Before this, several templates left thinking disabled or used generic limits that didn't line up with the model's capabilities.

| Provider | Thinking tokens | Output tokens |
|---|---|---|
| MiniMax M2.7 | 32K | 64K |
| DeepSeek V4-Pro | 32K | 128K |
| MiMo V2.5-Pro (both plans) | enabled | 128K |
| Kimi K2.5 | 16K | 64K |
| Qwen3-Coder (both plans) | 16K | 64K |

## Model name fixes

Two model references changed:

- **MiMo** (pay-per-token and Token Plan): bumped from `mimo-v2.5-pro` to `mimo-v2.5-pro[1m]` and `mimo-v2.5` to `mimo-v2.5[1m]`. The `[1m]` variant gives you the full 1M-token context window instead of the default 128K.
- **Kimi**: opus model corrected from `kimi-k2.6` to `kimi-k2.5`. The K2.6 opus tier doesn't exist on the Anthropic-compatible endpoint. K2.5 is the right model.

If you created a MiMo or Kimi instance before this update, your `settings.json` still has the old model names. You can either run the instance migration (which updates the wrapper script) or edit the model fields by hand.

## Running the migration

```bash
claude-multi doctor check   # see what needs updating
claude-multi doctor fix     # apply fixes
```

Or from the TUI: press `!` to open the health screen, then `f` to fix.

## Under the hood

The migration system gained two new functions: `getGlobalClaudePath()` and `tryGetGlobalClaudePath()` in `wrapper.ts`. These resolve the claude binary from the env override or PATH, without checking the pinned binary. The instance migration uses these to generate wrappers that point at whatever `claude` you have installed.

The old `getClaudePath()` function still exists and still checks the pinned binary first. It's used when creating new instances. The health check's `fixWrapperVersions` also still targets the pinned binary for its "safe park" behavior. These are separate flows from the migration, and they work differently on purpose.

---

Full provider reference with model mappings, endpoint URLs, and plan notes is at [/docs/providers/](/docs/providers/). Changelog with all the details is at [CHANGELOG.md](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md).
