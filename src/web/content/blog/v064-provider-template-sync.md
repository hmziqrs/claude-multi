---
title: "v0.6.4: Existing Instances Now Auto-Sync Provider Template Updates"
description: "A new instance migration detects which provider each instance uses and re-applies the latest template config (model names, thinking tokens, output limits) to settings.json. API keys and custom env vars are preserved."
date: 2026-05-29
tags: [release, migration, providers, templates]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/v064-provider-template-sync.mp3"
---

# v0.6.4: Existing Instances Now Auto-Sync Provider Template Updates

Here's the problem. When we update a provider template in claude-multi, the new model names and token limits only affect instances created after the update. Your existing MiMo instance still has `mimo-v2.5-pro` without the `[1m]` context window. Your DeepSeek instance is missing `MAX_THINKING_TOKENS`. Nobody goes back and edits `settings.json` by hand.

v0.6.4 fixes this with a new instance migration that detects which provider each instance uses and re-applies the latest template.

## How it works

The migration reads each instance's `settings.json`, extracts `ANTHROPIC_BASE_URL`, and matches it against the nine known provider templates (including MiMo Token Plan region variants). If it finds a match, it re-applies the latest template env vars as a spread merge:

- Template values (model names, thinking/output limits) overwrite existing keys
- Your API key survives
- Any env vars you added yourself survive
- If your base URL doesn't match any template, the migration skips that instance

The first time this runs, it also writes a `providerTemplate` field to the instance metadata in `config.json`. Future migrations use that field instead of re-detecting from the base URL.

## What this means for your instances

If you created an instance before the v0.6.3 template updates, running `claude-multi doctor fix` will now sync these changes:

- **MiMo**: `mimo-v2.5-pro` becomes `mimo-v2.5-pro[1m]` (1M context window)
- **DeepSeek**: gets `MAX_THINKING_TOKENS: "32000"` and `MAX_OUTPUT_TOKENS: "128000"`
- **Kimi**: opus corrected from `kimi-k2.6` to `kimi-k2.5`, gets thinking and output limits
- **MiniMax, Qwen**: get their respective thinking and output token limits

## Running it

```bash
claude-multi doctor check   # see what needs updating
claude-multi doctor fix     # apply fixes
```

Or from the TUI: press `!` to open the health screen, then `f` to fix.

---

Provider reference with model mappings, endpoints, and plan notes: [/docs/providers/](/docs/providers/). Full changelog: [CHANGELOG.md](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md).
