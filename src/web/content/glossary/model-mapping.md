---
title: "Model Mapping"
description: "The set of environment variables that tell Claude Code which model to use for each role (Sonnet, Opus, Haiku) when working with a non-Anthropic provider."
term: "Model Mapping"
category: "Configuration"
related:
  - "provider-template"
  - "base-url"
  - "context-window"
  - "auto-compaction"
---

Model mapping is how Claude Code knows which model name to send in API requests when you're using a non-Anthropic provider. Claude Code internally uses roles like "Sonnet", "Opus", and "Haiku" to pick models for different tasks. Provider templates remap these roles to the actual model names offered by the provider.

## The environment variables

Provider templates set these variables in the wrapper script:

- `ANTHROPIC_MODEL`: the default model for general use
- `ANTHROPIC_SMALL_FAST_MODEL`: the model used for quick, cheap tasks (maps to Haiku)
- `ANTHROPIC_DEFAULT_SONNET_MODEL`: the model used for standard coding tasks
- `ANTHROPIC_DEFAULT_OPUS_MODEL`: the model used for complex reasoning
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`: the model used for fast responses

## Example mappings

**GLM template:**
- Default: `glm-5.1`
- Fast: `glm-5-turbo`
- Sonnet/Opus/Haiku: all mapped to `glm-5-turbo` or `glm-5.1`

**MiniMax template:**
- All roles map to `MiniMax-M3`

**OpenRouter template:**
- You pick the model during setup, and all roles map to it

## Why it matters

Claude Code picks models based on task complexity. A quick autocomplete uses the "Haiku" role. A complex refactor uses the "Opus" role. If these aren't mapped correctly, Claude Code sends the wrong model name to the provider and the request fails.

## Customizing

You can change model mappings by editing the wrapper script. For example, if a provider releases a new model, you can update `ANTHROPIC_DEFAULT_SONNET_MODEL` without waiting for a claude-multi template update.
