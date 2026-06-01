---
title: Providers
description: AI provider templates and configuration
---

claude-multi ships ready-to-use templates for these providers. Each template pre-fills `ANTHROPIC_BASE_URL`, model mappings, and related env vars into your instance's `settings.json`. You only need to supply your API key.

## Template reference

| Template | Display name | Endpoint | Opus model | Sonnet/Haiku model |
|---|---|---|---|---|
| `glm` | GLM Coding Plan | `api.z.ai` | `glm-5.1` | `glm-5-turbo` |
| `minimax` | MiniMax | `api.minimax.io` | `MiniMax-M3` | `MiniMax-M3` |
| `deepseek` | DeepSeek | `api.deepseek.com` | `deepseek-v4-pro[1m]` | `deepseek-v4-flash` |
| `mimo` | Xiaomi MiMo | `api.xiaomimimo.com` | `mimo-v2.5-pro` | `mimo-v2.5` |
| `mimo-token` | Xiaomi MiMo (Token Plan) | `token-plan-cn.xiaomimimo.com` | `mimo-v2.5-pro` | `mimo-v2.5` |
| `kimi` | Moonshot Kimi | `api.moonshot.ai` | `kimi-k2.6` | `kimi-k2.5` |
| `qwen` | Alibaba Qwen | `dashscope-intl.aliyuncs.com` | `qwen3-coder-next` | `qwen3-coder-flash` |
| `qwen-coding` | Alibaba Qwen Coding Plan | `coding-intl.dashscope.aliyuncs.com` | `qwen3-coder-next` | `qwen3-coder-flash` |

All providers expose an Anthropic-compatible API, so claude-multi points the same Claude Code binary at whichever endpoint you pick.

## Plan distinctions

Some providers offer two access models, a pay-per-token API and a subscription/coding plan, each with a **different base URL**. Use the right template for your account type:

| Provider | Pay-per-token template | Subscription template |
|---|---|---|
| Xiaomi MiMo | `mimo` | `mimo-token` (regional URL, swap in CN/SG/EU endpoint from your console) |
| Alibaba Qwen | `qwen` | `qwen-coding` |
| GLM (Z.ai) | no Anthropic URL | `glm` (Anthropic endpoint is coding-plan-only) |
| MiniMax | `minimax` | same URL, different key type |
| Moonshot Kimi | `kimi` | pay-per-token only |
| DeepSeek | `deepseek` | pay-per-token only |

## Notes

- **GLM**: The Anthropic-compatible endpoint (`api.z.ai/api/anthropic`) is exclusive to the Z.ai Coding Plan subscription. The standard pay-per-token API only exposes an OpenAI-compatible URL.
- **MiMo Token Plan**: The default base URL is the CN regional endpoint. If your subscription is on SG or EU, update `ANTHROPIC_BASE_URL` in `~/.claude-<name>/settings.json` with the endpoint shown in your subscription console.
- **Kimi**: No subscription plan, strictly pay-per-token at `api.moonshot.ai`.
- **MiniMax**: Both Token Plan and pay-per-token use the same `api.minimax.io` endpoint; the API key type determines which quota is consumed. MiniMax-M3 has a 1M token context window and supports text, image, and video inputs.
