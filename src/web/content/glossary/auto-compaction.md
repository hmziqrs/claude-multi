---
title: "Auto-Compaction"
description: "A mechanism that summarizes earlier conversation history when the context window fills up, keeping the session running without losing too much information."
term: "Auto-Compaction"
category: "Concepts"
related:
  - "context-window"
  - "model-mapping"
---

Auto-compaction is Claude Code's built-in feature that compresses conversation history when the context window approaches its limit. Instead of crashing or truncating, it summarizes older messages so the session can continue.

## How it works

Claude Code tracks how many tokens the current conversation has consumed. When usage crosses a configurable percentage of the context window, it pauses the session, summarizes the oldest messages, and replaces them with a shorter summary. The session then continues with freed-up space.

## Provider-specific tuning

Different models have different context windows, so compaction thresholds need to match. claude-multi's provider templates set two key variables:

- `CLAUDE_CODE_AUTO_COMPACT_WINDOW`: the model's actual context window size in tokens
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`: the percentage threshold that triggers compaction

For example, the GLM template sets the window to 131072 (128K) and the trigger to 75%. Without these overrides, Claude Code assumes a 200K window (the default for Claude models), which means compaction never triggers early enough and the API call fails when the real 128K limit is exceeded.

## What happens without it

If compaction doesn't trigger at the right time, the model hits its token limit mid-request. The API returns an error and the conversation dies. That's why getting these values right per provider matters.
