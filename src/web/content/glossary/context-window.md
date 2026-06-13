---
title: "Context Window"
description: "The maximum number of tokens a model can process in a single conversation, including both input and output."
term: "Context Window"
category: "Concepts"
related:
  - "auto-compaction"
  - "model-mapping"
  - "llm-routing"
---

The context window is the total number of tokens a model can work with at once. It includes the system prompt, conversation history, code you've pasted, and the model's response. When the window fills up, something has to give.

## Why it matters for claude-multi

Different providers offer different context windows:

- **GLM-5.2**: 1M tokens (GLM-5.1 and GLM-5-Turbo: 200K)
- **MiniMax-M3**: 1M tokens
- **DeepSeek-V3**: 128K tokens
- **Claude Sonnet 4**: 200K tokens

If you're working with a large codebase, a small context window means the model forgets earlier parts of the conversation sooner. A large window means it can hold more context but costs more per request.

## Context limits and auto-compaction

Claude Code monitors context usage and triggers compaction when it hits a threshold. Different models need different thresholds. That's why some provider templates set `CLAUDE_CODE_AUTO_COMPACT_WINDOW` and `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` to values that match the model's actual limits.

## Practical impact

If you regularly work with files over 10K lines or need the model to remember a long conversation, pick a provider with a larger context window. If your sessions are short and focused, a smaller window works fine and costs less.
