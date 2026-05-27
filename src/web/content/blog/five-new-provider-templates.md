---
title: "Five New Provider Templates: MiMo, Kimi, Qwen, and More"
description: "claude-multi now ships templates for Xiaomi MiMo, Moonshot Kimi, and Alibaba Qwen — including separate templates for providers that split their API across pay-per-token and subscription coding plans."
date: 2026-05-27
tags: [providers, templates, announcement]
---

When I started claude-multi, the goal was simple: stop editing `settings.json` by hand every time you want to switch providers. GLM, MiniMax, DeepSeek — those three covered the most common alternatives to Anthropic, and that felt like enough.

Then the past few months happened. Xiaomi shipped MiMo-V2.5-Pro with a 1-trillion parameter MoE at a fraction of Claude's per-token cost. Moonshot dropped Kimi K2.6 and matched frontier benchmarks on agentic coding. Alibaba's Qwen3-Coder-Next quietly became the go-to model for a lot of the open-source crowd. The provider landscape got busy fast, and the template list needed to catch up.

So here's what's new.

## The five new templates

### Xiaomi MiMo (`mimo`)

MiMo-V2.5-Pro is a 1T MoE model with 42B active parameters and a 1M-token context window. It has a native Anthropic-compatible endpoint, which means zero friction with Claude Code — swap the URL, paste your key, done.

- **Opus/Sonnet**: `mimo-v2.5-pro`
- **Haiku/fast**: `mimo-v2.5` (310B, 15B active — meaningfully cheaper for background tasks)
- **Endpoint**: `api.xiaomimimo.com/anthropic`

### Xiaomi MiMo Token Plan (`mimo-token`)

MiMo also offers a subscription model called Token Plan — a monthly credit pool rather than pay-per-token billing. The catch: it runs on a different domain. Xiaomi exposes regional endpoints (CN, SG, EU), and the right one comes from your subscription console.

The template ships with the CN endpoint as a placeholder. After setup, edit `~/.claude-<name>/settings.json` and swap `ANTHROPIC_BASE_URL` for whichever regional URL your console shows.

### Moonshot Kimi (`kimi`)

Kimi K2.6 is Moonshot's open-weight 1T MoE, 32B active, 256K context. Released April 2026. It leads most agentic coding benchmarks while staying well below Claude Opus pricing.

One thing worth knowing: the `kimi-k2-turbo-preview` model was EOL'd on May 25, 2026. There's no K2.6-turbo yet. So the template uses:

- **Opus**: `kimi-k2.6`
- **Sonnet/Haiku**: `kimi-k2.5` — same model family, ~37% cheaper per token, still active

Moonshot is strictly pay-per-token. No separate subscription plan, no different URL for different billing tiers.

### Alibaba Qwen (`qwen`)

Qwen3-Coder is the coding-specialized branch of the Qwen3 family. The three-tier model lineup maps cleanly onto Claude Code's internal model roles:

- **Opus**: `qwen3-coder-next`
- **Sonnet**: `qwen3-coder-plus`
- **Haiku**: `qwen3-coder-flash`

Endpoint: `dashscope-intl.aliyuncs.com/apps/anthropic` (the international DashScope instance).

### Alibaba Qwen Coding Plan (`qwen-coding`)

Alibaba offers a subscription coding plan with dedicated infrastructure — different subdomain, separate quota, subscription-based pricing. If you're on the coding plan rather than pay-per-token, use this template instead:

- Same models as `qwen`
- Endpoint: `coding-intl.dashscope.aliyuncs.com/apps/anthropic`

---

## The plan-split problem

Adding MiMo and Qwen surfaced something worth explaining: some providers run their pay-per-token API and their coding plan subscription on **completely different base URLs**. This isn't a minor detail — if you use the wrong URL for your account type, your API key won't authenticate.

Here's the full picture across all providers claude-multi supports:

| Provider | Has plan split? | How |
|---|---|---|
| GLM (Z.ai) | Yes | Anthropic endpoint exists **only** for Coding Plan — standard API has no Anthropic URL |
| Xiaomi MiMo | Yes | Different domain per plan (`api.xiaomimimo.com` vs `token-plan-*.xiaomimimo.com`) |
| Alibaba Qwen | Yes | Different subdomain (`dashscope-intl` vs `coding-intl.dashscope`) |
| MiniMax | Partial | Same URL for both; different key type determines which quota is consumed |
| Moonshot Kimi | No | Pay-per-token only, single endpoint |
| DeepSeek | No | Pay-per-token only, single endpoint |

The GLM situation is the most surprising: the Anthropic-compatible URL at `api.z.ai/api/anthropic` **only works if you have a Coding Plan subscription**. Regular pay-per-token GLM users get an OpenAI-compatible API only. That's why the template is now called "GLM Coding Plan" rather than just "GLM."

---

## Getting started

Pick a template in the TUI when creating a new instance, or pass it on the CLI:

```bash
claude-multi add kimi --provider kimi --api-key sk-...
claude-multi add qwen --provider qwen --api-key sk-...
claude-multi add mimo --provider mimo --api-key sk-...
```

If you're on a Token Plan or Coding Plan, use the subscription variant:

```bash
claude-multi add mimo --provider mimo-token --api-key tp-...
claude-multi add qwen --provider qwen-coding --api-key sk-...
```

Then just run `claude-kimi`, `claude-qwen`, or `claude-mimo` from any terminal. The provider-specific env vars are already wired into the instance's `settings.json` — no manual editing required.

---

The full provider reference with model mappings, endpoint URLs, and plan notes is at [/docs/providers/](/docs/providers/).
