---
title: "Kimi K2.7 for Claude Code: Three-Tier Model Mapping, Agentic Benchmarks"
description: "Moonshot released Kimi K2.7 with improved agentic coding performance. The claude-multi kimi template now maps K2.7 to opus, K2.6 to sonnet, and K2.5 to haiku. Updated benchmarks and template changes."
date: 2026-06-12
tags: [providers, models, kimi, benchmark, claude-code]
---

Moonshot released Kimi K2.7 today. The headline: improved agentic coding scores, better tool-use accuracy, and a new three-tier model mapping in the claude-multi kimi template. K2.7 fills the opus slot, K2.6 takes sonnet, and K2.5 stays on haiku and small/fast duties.

Existing Kimi instances can sync with `claude-multi doctor fix`. The rest of this post covers what changed and why it matters.

## What changed in the template

The model names in the `kimi` template now use three tiers instead of one:

| Role | Previous model | New model |
|------|---------------|-----------|
| Opus | `kimi-k2.5` | `kimi-k2.7` |
| Sonnet | `kimi-k2.5` | `kimi-k2.6` |
| Haiku | `kimi-k2.5` | `kimi-k2.5` |
| Small/Fast | `kimi-k2.5` | `kimi-k2.5` |

Previous template used K2.5 across all roles. The new mapping gives Claude Code access to K2.7 for heavy reasoning tasks and K2.6 for balanced sonnet-tier work, while keeping K2.5 for fast lightweight operations where speed matters more than capability.

All other template settings remain the same: 128K context window, 16K thinking tokens, 64K max output, auto-compaction tuned for the 128K window.

## K2.7 benchmarks

K2.7 improves on K2.6's agentic coding scores.

### Coding

| Benchmark | K2.7 | K2.6 | Opus 4.7 | GPT-5.5 |
|---|---|---|---|---|
| SWE-Bench Pro | **58.4** | 55.1 | 64.3 | 58.6 |
| SWE-Bench Verified | **79.2** | 76.8 | 87.6 | 82.9 |
| Terminal-Bench 2.1 | **62.5** | 58.3 | 66.1 | 78.2 |
| SVG-Bench | **61.8** | 58.2 | 62.3 | 58.2 |

K2.7 improves over K2.6 across all coding benchmarks. The gap to Opus 4.7 narrows on SWE-Bench Pro (58.4 vs 55.1 previously) and SVG-Bench edges closer (61.8 vs 62.3).

### Agentic

| Benchmark | K2.7 | K2.6 | Opus 4.7 |
|---|---|---|---|
| Claw-Eval | **68.3** | 62.1 | 71.6 |
| MCP Atlas | **71.5** | 67.8 | 77.0 |
| DRACO | **70.8** | 65.2 | 77.7 |

Claw-Eval is the end-to-end autonomous agent evaluation that most closely matches Claude Code usage. K2.7 scores 68.3, up from K2.6's 62.1. Still behind Opus 4.7, but the improvement is significant for a model update within the same family.

## Pricing

Kimi remains pay-per-token only with no subscription plan. K2.7 and K2.6 pricing is competitive with the K2.5 tier. Check [moonshot.ai](https://moonshot.ai) for current rates.

## When to use which tier

- **K2.7 (opus)**: Long-horizon agentic tasks, complex debugging, multi-file refactors. This is where the improved tool-use accuracy pays off.
- **K2.6 (sonnet)**: Balanced coding work — writing features, code review, interactive pair programming. Better capability than K2.5 at moderate cost.
- **K2.5 (haiku/fast)**: Quick lookups, simple edits, git operations, any task where speed matters more than deep reasoning.

The three-tier mapping means Claude Code automatically routes heavy tasks to K2.7 and lightweight ones to K2.5, without you having to think about it.

## Related

- [Kimi provider page](/providers/kimi/): full setup guide
- [v0.6.3 blog post](/blog/v063-migration-and-provider-updates/): previous Kimi template changes
- [Five new provider templates](/blog/five-new-provider-templates/): original Kimi announcement
