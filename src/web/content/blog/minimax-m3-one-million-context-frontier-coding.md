---
title: "MiniMax M3 for Claude Code: 1M Context, Benchmarks, Pricing"
description: "MiniMax M3 brings a 1M-token context window, frontier coding scores, and native multimodality to Claude Code. Updated template, benchmarks vs Opus 4.7, and pricing."
date: 2026-06-01
tags: [providers, models, minimax, benchmark, claude-code]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/minimax-m3-one-million-context-frontier-coding.mp3"
---

MiniMax released M3 yesterday. The short version: 1M-token context window, frontier coding scores, native image and video input, toggleable thinking. The claude-multi `minimax` template now uses it. Existing instances can sync with `claude-multi doctor fix`.

The longer version is worth reading. M3 clears Opus 4.7 on three benchmarks and costs about 1/30th the price. It is also the first open-weight model to ship with a 1M context window, frontier-level coding, and native multimodality all at once.

## What changed in the template

The model names in the `minimax` template went from `MiniMax-M2.7` to `MiniMax-M3` across all model slots (opus, sonnet, haiku, small/fast). If you created a MiniMax instance before this update, running `claude-multi doctor fix` will sync the new template automatically ([how template sync works](/blog/v064-provider-template-sync/)). Three things are different this time:

**No more auto-compaction override.** M2.7 had a 128K context window. Claude Code assumes 200K for unrecognized models, which meant auto-compaction never fired and context would fill to 100% before crashing. M3 has a 1M context window. The override is gone.

**Output tokens up to 512K.** M2.7 capped at 64K. M3 supports up to 512K output tokens, which matters for the long-horizon agentic tasks the model is built for.

**Effort level set to `max`.** M3 supports toggleable thinking. The template enables thinking with `REASONING_EFFORT: "high"` and sets `CLAUDE_CODE_EFFORT_LEVEL: "max"`.

## The M3 architecture: MSA

The headline technical feature is MiniMax Sparse Attention (MSA). Standard attention scales quadratically with context length. MSA replaces full attention with KV-block selection, where an index branch scores blocks of key-value pairs and a sparse branch only computes attention on the selected blocks.

The practical result: at 1M tokens, M3's per-token compute is 1/20th of the previous generation. Prefilling is 9x faster. Decoding is 15x faster. MiniMax claims MSA matches full attention on the vast majority of capabilities across their ablations.

M3 was designed around sparse attention from the start. The compute cost does not explode at long context the way it does with full attention, which is what makes the 1M window usable in practice rather than a spec sheet number.

## MiniMax M3 benchmarks

The coding and agentic benchmarks are what matter most for Claude Code users.

### Coding

| Benchmark | M3 | Opus 4.7 | GPT-5.5 | Gemini 3.1 Pro | M2.7 |
|---|---|---|---|---|---|
| SWE-Bench Pro | 59.0 | **64.3** | 58.6 | 54.2 | 56.2 |
| SWE-Bench Verified | 80.5 | **87.6** | 82.9 | 80.6 | 79.9 |
| Terminal-Bench 2.1 | 66.0 | 66.1 | **78.2** | 70.3 | 51.1 |
| SVG-Bench | **63.7** | 62.3 | 58.2 | 59.2 | 48.0 |
| KernelBench Hard | 28.8 | **30.7** | 20.9 | 18.6 | 10.5 |
| PaperBench | 52.6 | **58.5** | 57.5 | 46.7 | 30.6 |

M3 beats GPT-5.5 on SWE-Bench Pro (59.0 vs 58.6) and edges past Opus 4.7 on SVG-Bench (63.7 vs 62.3). Opus still leads the main SWE-Bench scores. But M3 went from mid-pack with M2.7 to second place on most coding benchmarks, and the gap to Opus is narrower than the gap between Opus and the rest.

### Agentic

| Benchmark | M3 | Opus 4.7 | GPT-5.5 | M2.7 |
|---|---|---|---|---|
| Claw-Eval | **74.5** | 71.6 | -- | 49.7 |
| MCP Atlas | 74.2 | **77.0** | 75.3 | 49.4 |
| DRACO | 73.2 | **77.7** | -- | 66.8 |
| BankerToolBench | 76.1 | **81.3** | 70.0 | 63.9 |

Claw-Eval is the end-to-end autonomous agent evaluation. M3 takes the top spot at 74.5, ahead of Opus 4.7 at 71.6. This is the benchmark that most closely matches what Claude Code does: sustained multi-step tool use in a real environment. M3 was trained for multi-turn production-like collaboration using an interactive user-simulator framework.

### Multimodal

| Benchmark | M3 | Opus 4.7 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|
| OmniDocBench | **91.6** | 89.3 | 87.5 | 88.1 |
| MMMU-Pro | 78.1 | 77.0 | **81.2** | 80.5 |
| Video-MMMU | 84.6 | 83.0 | 86.4 | **87.9** |

OmniDocBench measures multimodal document understanding across text, tables, charts, and images. M3 leads at 91.6. If you use Claude Code for document-heavy workflows, M3 can ingest the paper, figures, tables, and formulas all at once within its 1M context window.

### The jump from M2.7

The upgrade from M2.7 to M3 is massive. On SWE-Bench Pro, M3 jumps from 56.2 to 59.0. On KernelBench Hard, it nearly triples from 10.5 to 28.8. On Claw-Eval, it goes from 49.7 to 74.5. On SVG-Bench, from 48.0 to 63.7. PaperBench goes from 30.6 to 52.6. Across every benchmark, M3 is a different class of model than M2.7.

## MiniMax M3 pricing and Token Plans

Through the MiniMax API:

| Tier | Input (per 1M) | Output (per 1M) | Context |
|---|---|---|---|
| Standard (up to 512K) | $0.60 | $2.40 | up to 512K |
| Long context (512K to 1M) | $1.20 | $4.80 | 512K to 1M |
| Cache read | $0.12 | -- | -- |

For comparison, Claude Opus 4.7 runs about $15/M input and $75/M output. M3 at $2.40/M output is roughly 1/30th the cost. Even at the long-context tier ($4.80/M output), it is still a fraction of what Opus charges.

MiniMax also offers Token Plans (subscription):
- **Plus**: $20/month for about 1.7 billion tokens
- **Max**: $50/month for about 5.1 billion tokens
- **Ultra**: $120/month for about 9.8 billion tokens

Both Token Plan and pay-per-token use the same `api.minimax.io` endpoint. The API key type determines which quota is consumed.

## Real-world demonstrations

MiniMax published three extended task runs that show what 1M context plus frontier coding looks like in practice.

**CUDA kernel optimization.** M3 optimized an FP8 GEMM kernel on NVIDIA Hopper GPUs over 24 hours. 147 submissions, 1,959 tool calls. Hardware peak utilization went from 7.6% to 71.3%, a 9.4x speedup. Most models stopped improving within 30 submissions. M3's best solution showed up on submission 145. The tool call history gets dense and structured fast, and MSA's sparse attention keeps the model focused on what matters as the conversation grows.

**Paper reproduction.** M3 autonomously reproduced an ICLR 2025 Outstanding Paper over 12 hours. 18 commits, 23 experimental figures. The paper's text, formulas, and figures all fit in context at once. The multimodal input handled the curves and charts natively.

**Training models from scratch.** On PostTrainBench, M3 was given four base models and told to synthesize data, train, evaluate, and iterate, all without human intervention. It scored 0.37, compared to Opus 4.7 at 0.42 and GPT-5.5 at 0.39.

## Getting started

**New instance:**

```bash
claude-multi add minimax --provider minimax --api-key sk-...
```

**Existing instance (sync to M3):**

```bash
claude-multi doctor check   # see what needs updating
claude-multi doctor fix     # re-applies the latest template
```

Or from the TUI: press `!` to open the health screen, then `f` to fix. The sync preserves your API key and any custom env vars you set.

---

Provider reference with model mappings, endpoints, and plan notes: [/docs/providers/](/docs/providers/). Environment variable reference: [/docs/environment-variables/](/docs/environment-variables/). Template source: [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts). For background on how the minimax template was originally added, see [Five New Provider Templates](/blog/five-new-provider-templates/).
