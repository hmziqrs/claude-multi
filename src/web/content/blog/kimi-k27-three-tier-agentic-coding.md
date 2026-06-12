---
title: "Kimi K2.7 Code for Claude Code: Three-Tier Model Mapping"
description: "Moonshot released Kimi K2.7 Code, a coding-focused agentic model built on K2.6 with 256K context and ~30% less thinking-token usage. The claude-multi kimi template now maps K2.7 Code to opus, K2.6 to sonnet, and K2.5 to haiku."
date: 2026-06-12
tags: [providers, models, kimi, benchmark, claude-code]
---

Moonshot released [Kimi K2.7 Code](https://huggingface.co/moonshotai/Kimi-K2.7-Code) — a coding-focused agentic model built on K2.6 with double-digit improvements on coding and agent benchmarks, and roughly 30% less thinking-token usage. The claude-multi kimi template now maps K2.7 Code to the opus role, K2.6 to sonnet, and K2.5 to haiku.

Existing Kimi instances can sync with `claude-multi doctor fix`. The rest of this post covers what changed, the benchmarks, and why it matters.

## What changed in the template

The model names in the `kimi` template now use three tiers:

| Role | Previous model | New model |
|------|---------------|-----------|
| Opus | `kimi-k2.5` | `kimi-k2.7-code` |
| Sonnet | `kimi-k2.5` | `kimi-k2.6` |
| Haiku | `kimi-k2.5` | `kimi-k2.5` |
| Small/Fast | `kimi-k2.5` | `kimi-k2.5` |

The context window was also corrected from 128K to 256K, matching the actual model spec from the [Kimi API platform](https://platform.kimi.ai/docs/pricing/chat-k27-code). Auto-compaction now targets 256K (262,144 tokens) instead of 128K.

All three tiers share the same MoE architecture: 1 trillion total parameters, 32 billion activated, with 256K context and 65,536 max output tokens.

## K2.7 Code benchmarks

The following benchmarks are from the [official model card on HuggingFace](https://huggingface.co/moonshotai/Kimi-K2.7-Code). All models were tested with thinking mode enabled. K2.7 Code and K2.6 ran via Kimi Code CLI at temperature 1.0, top-p 0.95, 262K context. GPT-5.5 ran in Codex xhigh mode; Opus 4.8 ran in Claude Code xhigh mode.

### Coding

| Benchmark | K2.6 | K2.7 Code | GPT-5.5 | Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50.9 | **62.0** | 69.0 | 67.4 |
| Program Bench | 48.3 | **53.6** | 69.1 | 63.8 |
| MLS Bench Lite | 26.7 | **35.1** | 35.5 | 42.8 |

K2.7 Code improves over K2.6 across all coding benchmarks. On Kimi Code Bench v2 (Moonshot's in-house benchmark for realistic coding tasks across 10+ languages), K2.7 Code jumps from 50.9 to 62.0 — closing the gap with Opus 4.8 at 67.4.

On Program Bench (recreate a program's behavior from a compiled binary and its documentation), K2.7 Code scores 53.6 vs K2.6's 48.3. MLS Bench Lite (inventing generalizable ML methods) shows a similar jump: 35.1 vs 26.7.

### Agentic

| Benchmark | K2.6 | K2.7 Code | GPT-5.5 | Opus 4.8 |
|---|---|---|---|---|
| Kimi Claw 24/7 Bench | 42.9 | **46.9** | 52.8 | 50.4 |
| MCP Atlas | 69.4 | **76.0** | 79.4 | 81.3 |
| MCP Mark Verified | 72.8 | **81.1** | 92.9 | 76.4 |

The agentic benchmarks are where K2.7 Code shines for Claude Code users. MCP Mark Verified (human-verified MCP tool-use tasks across Notion, GitHub, Filesystem, Postgres, and Playwright) jumps from 72.8 to 81.1 — beating Opus 4.8's 76.4.

MCP Atlas (realistic tool-use tasks via MCP) improves from 69.4 to 76.0. These directly reflect the multi-step tool chains that Claude Code relies on.

## Efficiency

K2.7 Code uses approximately 30% fewer thinking tokens than K2.6 for equivalent tasks, according to the model card. Lower thinking-token usage means faster responses and lower cost per task — especially important for Claude Code's agentic loop where the model thinks on every turn.

The model also forces `preserve_thinking` mode, which retains full reasoning content across multi-turn interactions. This is beneficial for coding agent scenarios where the model needs to reference earlier reasoning in later turns.

## Pricing

K2.7 Code is available at $0.95/MTok input (cache miss), $0.19/MTok input (cache hit), and $4.00/MTok output on the [Kimi API platform](https://platform.kimi.ai/docs/pricing/chat-k27-code). A [limited-time promotion](https://platform.kimi.ai/docs/pricing/promotion) is running through July 2, 2026.

Kimi remains pay-per-token only with no subscription plan.

## When to use which tier

- **K2.7 Code (opus)**: Long-horizon agentic tasks, complex debugging, multi-file refactors. The improved MCP tool-use accuracy and lower thinking-token cost make it ideal for Claude Code's core workflow.
- **K2.6 (sonnet)**: Balanced coding work — writing features, code review, interactive pair programming. Better capability than K2.5 at moderate cost.
- **K2.5 (haiku/fast)**: Quick lookups, simple edits, git operations, any task where speed matters more than deep reasoning.

The three-tier mapping means Claude Code automatically routes heavy tasks to K2.7 Code and lightweight ones to K2.5, without you having to think about it.

## Related

- [Kimi provider page](/providers/kimi/): full setup guide
- [Kimi K2.7 Code on HuggingFace](https://huggingface.co/moonshotai/Kimi-K2.7-Code): model card and weights
- [Kimi API platform](https://platform.kimi.ai/docs/pricing/chat-k27-code): pricing and docs
