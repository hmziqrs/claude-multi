---
title: "Kimi K2.7 Code: launch tiers and the K3.1 shift"
description: "Kimi K2.7 Code launched with three tiers. K3.1 Pro now fills every slot, the K2 series is closing, and Highspeed is an optional upgrade."
date: 2026-06-12
updated: 2026-10-31
tags: [providers, models, kimi, benchmark, claude-code]
---

Moonshot released [Kimi K2.7 Code](https://huggingface.co/moonshotai/Kimi-K2.7-Code) on 2026-06-12. It is a coding-focused model built on K2.6, with double-digit gains on coding and agent benchmarks and about 30% fewer thinking tokens. The claude-multi kimi template mapped K2.7 Code to opus, K2.6 to sonnet, and K2.5 to haiku at launch.

> **Update (2026-10-31):** Kimi K3.1 Pro is now the template's only model. It has a 1,048,576-token context window and costs $2 input / $10 output per 1M. The standard model fills primary, opus, sonnet, haiku, and subagent slots. K2 series models close to newly registered users on October 31, 2026, and Moonshot plans to retire all of them by the end of December. K2.7 Code is still served at $0.95/$4.00 for existing users. See [Kimi's pricing page](https://platform.moonshot.ai/docs/pricing/chat).

## What changed at launch

| Role | Previous model | New model |
|------|---------------|-----------|
| Opus | `kimi-k2.5` | `kimi-k2.7-code` |
| Sonnet | `kimi-k2.5` | `kimi-k2.6` |
| Haiku | `kimi-k2.5` | `kimi-k2.5` |
| Small/Fast | `kimi-k2.5` | `kimi-k2.5` |

At launch, Claude Code got K2.7 Code for heavy reasoning, K2.6 for balanced work, and K2.5 for fast operations. Two things have changed since.

Moonshot retired `kimi-k2.5` on August 31, 2026, and calls to that ID now return a 404. The 0.12.x template pointed the haiku and small/fast slots at it, so a new Kimi instance built from that template failed when Claude Code called those slots. Version 0.13.0 uses `kimi-k3.1-pro[1m]` in every slot, including haiku and subagents. Run `claude-multi doctor fix` on an older instance before you start.

If you are on 0.12.x or managing settings by hand, the env block is:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_kimi_api_key",
    "ANTHROPIC_BASE_URL": "https://api.moonshot.ai/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "ANTHROPIC_MODEL": "kimi-k3.1-pro[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "kimi-k3.1-pro[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "kimi-k3.1-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "kimi-k3.1-pro[1m]",
    "CLAUDE_CODE_SUBAGENT_MODEL": "kimi-k3.1-pro[1m]",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "1000000",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "128000",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "MAX_THINKING_TOKENS": "16000"
  }
}
```

Highspeed is optional. It runs the same model 2 to 3 times faster and costs double: $4 input / $20 output per 1M against $2/$10 for standard. The template keeps standard speed. Haiku and subagent calls are frequent and short, so the premium adds up faster than the latency saving. If you want it, set `ANTHROPIC_DEFAULT_HAIKU_MODEL` and `CLAUDE_CODE_SUBAGENT_MODEL` to `kimi-k3.1-pro-highspeed[1m]`, and keep the main slots on standard.

Do not mix K3.1 Pro and a K2 model in the same instance. Claude Code applies one compaction window, so the 1M setting will let a 256K K2 model overflow. If you already have K2.7 access and want to keep the cheaper coding model while it lasts, use `kimi-k2.7-code` for opus and `kimi-k2.6` for the other slots, and keep the compaction window at `262144`.

The K2 line also has an end date. K2.6 and K2.7 Code close to newly registered users on October 31, 2026, and Moonshot plans to retire all K2 models by the end of December. If you are setting up Kimi today, K3.1 Pro is the safer default.

## Context and compaction

K3.1 Pro has a 1,048,576-token context window. The `[1m]` suffix tells Claude Code to use it, and the template sets `CLAUDE_CODE_AUTO_COMPACT_WINDOW` to 1000000. Without the suffix or the window, Claude Code assumes 200K for an unrecognized model and compacts early. The template also sets `CLAUDE_CODE_MAX_OUTPUT_TOKENS` to 128000. Kimi documents 131,072 default output and up to 1,048,576, but Claude Code caps an unrecognized model at 128,000.

The K2 tiers used a 262,144-token window. A K2-only instance needs 262144, not 1000000, or the 1M setting will let a 256K model overflow.

All three K2 tiers share the same architecture: 1 trillion total parameters (MoE), 32 billion active, 256K context, and a 32K default output. The compaction window is the part that matters: without it, Claude Code assumes 200K and compacts early.

## Benchmarks

These numbers come from the [official model card on Hugging Face](https://huggingface.co/moonshotai/Kimi-K2.7-Code). Moonshot ran them. They are not independent.

K2.7 Code and K2.6 ran via Kimi Code CLI at temperature 1.0, top-p 0.95, and 262K context. GPT-5.5 ran in Codex xhigh mode. Opus 4.8 ran in Claude Code xhigh mode.

### Coding

| Benchmark | K2.6 | K2.7 Code | GPT-5.5 | Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50.9 | **62.0** | 69.0 | 67.4 |
| Program Bench | 48.3 | **53.6** | 69.1 | 63.8 |
| MLS Bench Lite | 26.7 | **35.1** | 35.5 | 42.8 |

K2.7 Code improves over K2.6 on every coding benchmark. On Kimi Code Bench v2, Moonshot's internal benchmark for coding tasks across more than 10 languages, it jumps from 50.9 to 62.0. That closes most of the gap with Opus 4.8 at 67.4.

Program Bench asks the model to recreate a program's behavior from a compiled binary and its documentation. K2.7 Code scores 53.6 against K2.6's 48.3. MLS Bench Lite, which tests inventing generalizable ML methods, goes from 26.7 to 35.1, nearly matching GPT-5.5 at 35.5.

### Agentic

| Benchmark | K2.6 | K2.7 Code | GPT-5.5 | Opus 4.8 |
|---|---|---|---|---|
| Kimi Claw 24/7 Bench | 42.9 | **46.9** | 52.8 | 50.4 |
| MCP Atlas | 69.4 | **76.0** | 79.4 | 81.3 |
| MCP Mark Verified | 72.8 | **81.1** | 92.9 | 76.4 |

The agentic numbers matter most for Claude Code users. MCP Mark Verified is a human-verified benchmark for MCP tool-use tasks across Notion, GitHub, Filesystem, Postgres, and Playwright. K2.7 Code jumps from 72.8 to 81.1, which beats Opus 4.8's 76.4 on that benchmark.

MCP Atlas, which covers tool-use tasks via MCP, goes from 69.4 to 76.0. These are the multi-step tool chains Claude Code runs on every turn.

## Efficiency

The model card says K2.7 Code uses approximately 30% fewer thinking tokens than K2.6 for equivalent tasks. That matters for Claude Code's agentic loop, where the model thinks on every turn.

K2.7 Code also forces `preserve_thinking` mode, which keeps full reasoning content across multi-turn interactions. You cannot disable it. For coding agents this is useful because the model can reference its earlier reasoning in later turns.

## Pricing

K2.7 Code costs $0.95/MTok input on a cache miss, $0.19/MTok on a cache hit, and $4.00/MTok output on the [Kimi API platform](https://platform.moonshot.ai/docs/pricing/chat). A launch promotion ran through July 2, 2026. It has ended.

K3.1 Pro costs $2/MTok input and $10/MTok output with a 1M context. Highspeed costs $4/$20. K2.6 costs $0.95/$4.00 at 256K. Kimi is pay-per-token only. See [pricing details on the Kimi provider page](/providers/kimi/#pricing-details).

## When to use which tier

Today the template puts K3.1 Pro in every slot. That is the simplest setup, and it avoids the K2 end date. Keep the standard model in haiku and subagents; opt into Highspeed only if latency matters more than the doubled token price.

K2.7 Code is still a reasonable cheaper coding model for existing users while it lasts, and K2.6 is the fallback if you already have access. Do not build a new setup around K2.5.

The launch guidance still describes how the K2 models behave. K2.7 Code fits long agentic sessions, complex debugging, and multi-file refactors. K2.6 fits feature work, code review, and interactive pair programming. K2.5 was the fast tier for lookups, simple edits, and git operations. The retirement dates, not the benchmarks, are what should decide a new setup.

## Further reading

- [Kimi provider page](/providers/kimi/) for setup instructions and current pricing
- [Supported providers FAQ](/faq/#supported-providers) for a comparison of all available templates
- [Kimi K2.7 Code on Hugging Face](https://huggingface.co/moonshotai/Kimi-K2.7-Code) for the model card and weights
- [Kimi API pricing](https://platform.moonshot.ai/docs/pricing/chat) for the current rate card and retirement notice
