---
title: "Kimi K2.7 Code in Claude Code: Setup, Benchmarks & Tiers"
description: "Kimi K2.7 Code is now available in Claude Code via claude-multi. See benchmark results, the new three-tier model mapping (opus/sonnet/haiku), and setup steps."
date: 2026-06-12
tags: [providers, models, kimi, benchmark, claude-code]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/kimi-k27-three-tier-agentic-coding.mp3"
---

Moonshot released [Kimi K2.7 Code](https://huggingface.co/moonshotai/Kimi-K2.7-Code). It is a coding-focused model built on K2.6 with double-digit improvements on coding and agent benchmarks, and roughly 30% less thinking-token usage. The claude-multi kimi template now maps K2.7 Code to opus, K2.6 to sonnet, K2.5 to haiku.

If you already have a Kimi instance, run `claude-multi doctor fix` to sync.

## What changed

| Role | Previous model | New model |
|------|---------------|-----------|
| Opus | `kimi-k2.5` | `kimi-k2.7-code` |
| Sonnet | `kimi-k2.5` | `kimi-k2.6` |
| Haiku | `kimi-k2.5` | `kimi-k2.5` |
| Small/Fast | `kimi-k2.5` | `kimi-k2.5` |

The previous template used K2.5 across all roles. Now Claude Code gets K2.7 Code for heavy reasoning, K2.6 for balanced work, and K2.5 for fast lightweight operations.

The context window was also wrong. It was set to 128K in the template but the actual spec is 256K, confirmed on the [Kimi API platform](https://platform.kimi.ai/docs/pricing/chat-k27-code). Auto-compaction now targets 256K (262,144 tokens).

All three tiers share the same architecture: 1 trillion total parameters (MoE), 32 billion activated, 256K context, 65,536 max output tokens.

## Kimi K2.7 Code benchmarks vs GPT-5.5 and Opus 4.8

These numbers come from the [official model card on HuggingFace](https://huggingface.co/moonshotai/Kimi-K2.7-Code). K2.7 Code and K2.6 ran via Kimi Code CLI at temperature 1.0, top-p 0.95, 262K context. GPT-5.5 ran in Codex xhigh mode. Opus 4.8 ran in Claude Code xhigh mode.

### Coding benchmarks

| Benchmark | K2.6 | K2.7 Code | GPT-5.5 | Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50.9 | **62.0** | 69.0 | 67.4 |
| Program Bench | 48.3 | **53.6** | 69.1 | 63.8 |
| MLS Bench Lite | 26.7 | **35.1** | 35.5 | 42.8 |

K2.7 Code improves over K2.6 on every coding benchmark. On Kimi Code Bench v2 (Moonshot's internal benchmark for realistic coding tasks across 10+ languages), it jumps from 50.9 to 62.0. That closes most of the gap with Opus 4.8 at 67.4.

Program Bench asks the model to recreate a program's behavior from a compiled binary and its documentation. K2.7 Code scores 53.6 vs K2.6's 48.3. MLS Bench Lite (inventing generalizable ML methods) goes from 26.7 to 35.1, nearly matching GPT-5.5 at 35.5.

### Agentic benchmarks

| Benchmark | K2.6 | K2.7 Code | GPT-5.5 | Opus 4.8 |
|---|---|---|---|---|
| Kimi Claw 24/7 Bench | 42.9 | **46.9** | 52.8 | 50.4 |
| MCP Atlas | 69.4 | **76.0** | 79.4 | 81.3 |
| MCP Mark Verified | 72.8 | **81.1** | 92.9 | 76.4 |

The agentic numbers matter most for Claude Code users. MCP Mark Verified is a human-verified benchmark for MCP tool-use tasks across Notion, GitHub, Filesystem, Postgres, and Playwright. K2.7 Code jumps from 72.8 to 81.1, which beats Opus 4.8's 76.4.

MCP Atlas (tool-use tasks via MCP) goes from 69.4 to 76.0. These are the multi-step tool chains that Claude Code runs on every turn.

## Efficiency

The model card says K2.7 Code uses approximately 30% fewer thinking tokens than K2.6 for equivalent tasks. Lower thinking-token usage means faster responses and lower cost per task. That matters for Claude Code's agentic loop where the model thinks on every turn.

K2.7 Code also forces `preserve_thinking` mode, which keeps full reasoning content across multi-turn interactions. You cannot disable it. For coding agent scenarios this is useful because the model can reference its own earlier reasoning in later turns.

## Kimi K2.7 Code pricing

K2.7 Code costs $0.95/MTok input (cache miss), $0.19/MTok input (cache hit), and $4.00/MTok output on the [Kimi API platform](https://platform.kimi.ai/docs/pricing/chat-k27-code). A [limited-time promotion](https://platform.kimi.ai/docs/pricing/promotion) runs through July 2, 2026.

Kimi is pay-per-token only. No subscription plan. See [full pricing details on the Kimi provider page](/providers/kimi/#pricing).

## When to use which tier

K2.7 Code (opus) for long agentic sessions, complex debugging, and multi-file refactors. The improved tool-use accuracy and lower thinking-token cost make it the best fit for Claude Code's core workflow.

K2.6 (sonnet) for balanced work: writing features, code review, interactive pair programming. Better than K2.5 at moderate cost.

K2.5 (haiku/fast) for quick lookups, simple edits, git operations. Speed over deep reasoning.

The three-tier mapping means Claude Code routes heavy tasks to K2.7 Code and lightweight ones to K2.5 automatically.

## Further reading

- [Kimi provider page](/providers/kimi/) for setup instructions and full pricing
- [Supported providers FAQ](/faq/supported-providers/) for a comparison of all available templates
- [Kimi K2.7 Code on HuggingFace](https://huggingface.co/moonshotai/Kimi-K2.7-Code) for the model card and weights
- [Kimi API platform](https://platform.kimi.ai/docs/pricing/chat-k27-code) for official pricing and documentation
