---
title: "MiniMax M3.1 Flash in Claude Code: 1M context, flat pricing"
description: "MiniMax M3.1 Flash is now the minimax template default: 1M context, 512K max output, always-on thinking, and flat $0.15/$0.60 pricing. M3 stays available."
date: 2026-06-01
updated: 2026-10-31
tags: [providers, models, minimax, benchmark, claude-code]
---

MiniMax released M3.1 Flash on 2026-10-19. It is the default in the claude-multi `minimax` template, in the main, Opus, Sonnet, Haiku, and subagent slots. The template pins `MiniMax-M3.1-Flash[1m]` and sets a 524288 compaction window, effort `max`, and a 128000 output cap. Existing instances can sync with `claude-multi doctor fix`.

M3, released 2026-06-01, is the previous generation and remains available. MiniMax has announced M3.1 Pro but has not released it, so there is no Pro model to configure. The M3 sections below are kept as historical context.

## What the template sets

The model and context settings in `~/.claude-<name>/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.minimax.io/anthropic",
    "ANTHROPIC_MODEL": "MiniMax-M3.1-Flash[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "MiniMax-M3.1-Flash[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "MiniMax-M3.1-Flash[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "MiniMax-M3.1-Flash[1m]",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "524288",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "128000"
  }
}
```

The shipped settings also point the subagent slot at the same model, set `API_TIMEOUT_MS` to 3000000, and set `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` to 1. All model slots use one model, so there is no separate cheap tier inside the instance.

The 524288 compaction window is MiniMax's recommended setting for Claude Code even though the model supports 1M tokens. The same guide sets effort to `max`.

## M3.1 Flash specs

| Item | Value |
|---|---|
| Context window | 1,000,000 tokens |
| Maximum output | 524,288 tokens |
| Recommended output | 131,072 tokens |
| Thinking | Always on |
| Effort levels | `low`, `medium`, `high`, `xhigh`, `max` |
| Input | $0.15 per 1M tokens |
| Output | $0.60 per 1M tokens |
| Cache read | $0.015 per 1M tokens |

Thinking cannot be disabled. Sending `thinking: {"type": "disabled"}` returns a 400. The way to reduce thinking cost is to lower the effort level.

The model accepts up to 524,288 output tokens, but MiniMax recommends 131,072 for normal use. Claude Code caps output at 128,000 for an unrecognized model ID, so the template sets 128000, slightly below the vendor recommendation. The extra model headroom above 128K is not reachable through Claude Code.

Pricing is flat, with no long-context tier. MiniMax lists the same rates on its [pricing page](https://platform.minimax.io/docs/pricing/overview). M3.1 Flash does not support the `service_tier` field.

## What MiniMax reports for M3.1 Flash

MiniMax published these numbers in the [M3.1 Flash announcement](https://www.minimax.io/blog/minimax-m31f). They are vendor results, not independent tests.

| Benchmark | M3.1 Flash |
|---|---|
| BankerToolBench | 76.2 |
| DeepSWE v1.1 | 73.7% |
| OSWorld V2 | 61.7 |
| Agents' Last Exam | 29.6 |
| CyberGym | 82% |

MiniMax says the model is nearly three times faster in online inference and 70% cheaper to run than its predecessor. It reports 200+ tokens per second in everyday use, with a P50 of 170+.

## Historical context: the M3 architecture

M3 is the previous generation. This section and the benchmark tables that follow describe M3, not M3.1 Flash.

The main technical feature is MiniMax Sparse Attention (MSA). Standard attention scales quadratically with context length. MSA replaces full attention with KV-block selection: an index branch scores blocks of key-value pairs, and a sparse branch computes attention only on the selected blocks.

MiniMax says that at 1M tokens, M3's per-token compute is 1/20th of the previous generation. Prefilling is 9x faster, and decoding is 15x faster. The company also says MSA matches full attention on most capabilities in its ablations. Those are vendor claims, not independent measurements.

M3 was designed around sparse attention from the start, so compute cost does not grow at long context the way it does with full attention.

## Historical context: M3 benchmarks

Every number in this section comes from [MiniMax's M3 announcement](https://www.minimax.io/blog/minimax-m3). None is independently verified. These are M3 results, not M3.1 Flash results.

### Coding

| Benchmark | M3 | Opus 4.7 | GPT-5.5 | Gemini 3.1 Pro | M2.7 |
|---|---|---|---|---|---|
| SWE-Bench Pro | 59.0 | **64.3** | 58.6 | 54.2 | 56.2 |
| SWE-Bench Verified | 80.5 | **87.6** | 82.9 | 80.6 | 79.9 |
| Terminal-Bench 2.1 | 66.0 | 66.1 | **78.2** | 70.3 | 51.1 |
| SVG-Bench | **63.7** | 62.3 | 58.2 | 59.2 | 48.0 |
| KernelBench Hard | 28.8 | **30.7** | 20.9 | 18.6 | 10.5 |
| PaperBench | 52.6 | **58.5** | 57.5 | 46.7 | 30.6 |

M3 beats GPT-5.5 on SWE-Bench Pro (59.0 vs 58.6) and edges past Opus 4.7 on SVG-Bench (63.7 vs 62.3). Opus still leads the main SWE-Bench scores. M3 moved from mid-pack with M2.7 to the top group on most coding benchmarks.

### Agentic

| Benchmark | M3 | Opus 4.7 | GPT-5.5 | M2.7 |
|---|---|---|---|---|
| Claw-Eval | **74.5** | 71.6 | -- | 49.7 |
| MCP Atlas | 74.2 | **77.0** | 75.3 | 49.4 |
| DRACO | 73.2 | **77.7** | -- | 66.8 |
| BankerToolBench | 76.1 | **81.3** | 70.0 | 63.9 |

Claw-Eval is the end-to-end autonomous agent evaluation. M3 takes the top spot at 74.5, ahead of Opus 4.7 at 71.6. That benchmark is the closest match to what Claude Code does: sustained multi-step tool use in a real environment. MiniMax says it trained M3 for multi-turn collaboration with an interactive user simulator.

### Multimodal

| Benchmark | M3 | Opus 4.7 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|
| OmniDocBench | **91.6** | 89.3 | 87.5 | 88.1 |
| MMMU-Pro | 78.1 | 77.0 | **81.2** | 80.5 |
| Video-MMMU | 84.6 | 83.0 | 86.4 | **87.9** |

OmniDocBench measures document understanding across text, tables, charts, and images. M3 leads at 91.6. If you use Claude Code for document-heavy work, M3 can ingest the paper, figures, tables, and formulas in one 1M-token context window.

### The jump from M2.7

On SWE-Bench Pro, M3 goes from 56.2 to 59.0. On KernelBench Hard, it nearly triples from 10.5 to 28.8. On Claw-Eval, it goes from 49.7 to 74.5. On SVG-Bench, from 48.0 to 63.7. PaperBench goes from 30.6 to 52.6. Across these tables, M3 is a different class of model than M2.7.

## Historical context: M3 pricing

M3 keeps its two-tier rate. These prices apply to M3, not M3.1 Flash. The M3.1 Flash row is shown for comparison.

| Model | Input per 1M | Output per 1M | Cache read per 1M |
|---|---|---|---|
| M3, up to 512K input | $0.30 | $1.20 | $0.06 |
| M3, above 512K input | $0.60 | $2.40 | $0.12 |
| M3.1 Flash, flat | $0.15 | $0.60 | $0.015 |

M3 priority service costs 1.5x the standard rate: $0.45 input and $1.80 output up to 512K, $0.90 and $3.60 above it. The rates are on [MiniMax's pricing page](https://platform.minimax.io/docs/pricing/overview). The page labels the short tier a permanent 50% discount, so the struck-through list prices are the same as the long-context rates.

At the flat rate, M3.1 Flash output is about 42x cheaper than Claude Opus 4.7 at $25 per 1M tokens, and input is about 33x cheaper than Opus at $5. [Anthropic's price list](https://platform.claude.com/docs/en/about-claude/pricing) has the Opus rates. At the M3 short tier, output is about 21x cheaper than Opus, and input is about 17x cheaper. Above 512K, M3 output is about 10x cheaper, and input is about 8x cheaper.

MiniMax also sells M Plan subscriptions, a monthly plan that uses the same `api.minimax.io` endpoint. The API key type decides which quota is consumed. The [M Plan page](https://www.minimax.io/m-plan) has the current tiers.

## Historical context: M3 long-run reports

MiniMax published three extended task runs for M3. These are vendor reports, not replications.

CUDA kernel optimization. M3 optimized an FP8 GEMM kernel on NVIDIA Hopper GPUs over 24 hours. It made 147 submissions and 1,959 tool calls. Hardware peak utilization went from 7.6% to 71.3%, a 9.4x speedup. Most models in the report stopped improving within 30 submissions. M3's best solution showed up on submission 145.

Paper reproduction. M3 reproduced an ICLR 2025 Outstanding Paper over 12 hours, with 18 commits and 23 experimental figures. The paper's text, formulas, and figures all fit in context at once, so the model could read the curves and charts directly.

Training models from scratch. On PostTrainBench, M3 was given four base models and told to synthesize data, train, evaluate, and iterate without human intervention. It scored 0.37, against Opus 4.7 at 0.42 and GPT-5.5 at 0.39.

## Getting started

New instance:

```bash
claude-multi add minimax
```

Existing instance:

```bash
claude-multi doctor check   # see what needs updating
claude-multi doctor fix     # re-applies the latest template
```

Or from the TUI: press `!` to open the health screen, then `f` to fix. The sync preserves your API key and any custom env vars.

The template is current. You do not need to add the `[1m]` suffix or edit the model ID by hand. To use M3 instead of M3.1 Flash, change the model slots to `MiniMax-M3[1m]` and keep the 524288 window. M3 bills at the rates in the pricing section. M3.1 Pro is announced but not released, so there is nothing to configure for it.

---

Provider reference with model mappings, endpoints, and plan notes: [/providers/](/providers/). Environment variable reference: [/docs/environment-variables/](/docs/environment-variables/). Template source: [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts). For background on how the minimax template was originally added, see the [changelog](/changelog/).
