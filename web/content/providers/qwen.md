---
title: "Alibaba Qwen Provider for Claude Code"
description: "Run Claude Code with Qwen3.8-Max, Qwen3.7-Plus, and Qwen3.8-Flash on Alibaba Cloud Model Studio. 1M context, pay-as-you-go or Coding Plan."
provider: "qwen"
tagline: "Qwen3.8 and 3.7 models with 1M context"
setupCommand: "claude-multi add qwen"
useCases:
  - "Full-stack web development"
  - "Code completion and generation"
  - "Testing and CI pipeline work"
  - "Multi-language codebase navigation"
pricing: "Pay-per-token via Alibaba Cloud Model Studio"
order: 6
updated: 2026-10-31
---

Alibaba Cloud Model Studio recommends Qwen3.8-Max, Qwen3.7-Plus, and Qwen3.8-Flash for text and coding work. The claude-multi template maps those three models across the Claude Code roles. The Anthropic-compatible endpoint at `dashscope-intl.aliyuncs.com/apps/anthropic` accepts the models directly.

## Model specs

| Role | Model | Context | Max output |
|------|-------|---------|------------|
| Primary, opus | `qwen3.8-max` | 1M | 131K |
| Sonnet | `qwen3.7-plus` | 1M | 131K |
| Haiku, subagents | `qwen3.8-flash` | 1M | 131K |

Qwen3.8-Max is a 2.4-trillion-parameter MoE model with native vision input and a 1M window. Qwen3.7-Plus is the balanced model for general coding, tool use, and vision-language work. Qwen3.8-Flash is the cheapest of the three and supports both OpenAI and Anthropic protocols.

The current [Anthropic-compatible model matrix](https://www.alibabacloud.com/help/en/model-studio/anthropic-api-messages) lists `qwen3.8-max`, `qwen3.7-plus`, and `qwen3.8-flash`. It does not list `qwen3-coder-next` or `qwen3-coder-plus`. Only `qwen3-coder-flash` remains as a legacy Coder model, so the old three-tier Coder setup is no longer current.

## What the template pins

| Role | Model |
|------|-------|
| Primary, opus | `qwen3.8-max` |
| Sonnet | `qwen3.7-plus` |
| Haiku, subagents | `qwen3.8-flash` |

The template sets `CLAUDE_CODE_MAX_CONTEXT_TOKENS` to 983616, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` to 75, `CLAUDE_CODE_MAX_OUTPUT_TOKENS` to 128000, and `MAX_THINKING_TOKENS` to 16000. It does not set a reasoning effort level.

983616 is the thinking-mode input limit on the model cards, not an endpoint cap. The models list 1M context and 131072 output. Claude Code caps output at 128,000 for an unrecognized model ID, which is why the template sets 128000.

## Template status: current

The 0.13.0 template uses Qwen3.8-Max for primary and opus, Qwen3.7-Plus for sonnet, and Qwen3.8-Flash for haiku and subagents. The Coding Plan template uses `qwen3.7-plus` in every slot, with the same context and output variables. No manual edit is needed after `claude-multi add qwen` or `claude-multi add qwen-coding`.

## Setup

1. Create an Alibaba Cloud account and open [Model Studio](https://www.alibabacloud.com/en/product/modelstudio)
2. Generate an API key for the international endpoint
3. Run the setup command:

```sh
claude-multi add qwen
```

4. Paste your API key when prompted

The template configures `dashscope-intl.aliyuncs.com`. Mainland China accounts use the cn-beijing hosts shown in the Model Studio console.

## Pay-as-you-go vs Coding Plan

Alibaba sells two routes, and they use different hosts and different model mappings:

| Route | Template | Anthropic base URL |
|-------|----------|--------------------|
| Pay-as-you-go | `qwen` | `https://dashscope-intl.aliyuncs.com/apps/anthropic` |
| Coding Plan | `qwen-coding` | `https://coding-intl.dashscope.aliyuncs.com/apps/anthropic` |

Pay-as-you-go maps Qwen3.8-Max, Qwen3.7-Plus, and Qwen3.8-Flash across the roles. Coding Plan maps `qwen3.7-plus` to every slot. Pick the template that matches your account type; the two routes use separate keys and quotas.

The Coding Plan is $50/month. Quotas are 6,000 requests per 5 hours, 45,000 per week, and 90,000 per month. Those are request caps, not token caps. The plan is for interactive use in coding tools, so do not point it at automated scripts or a backend service.

The plan has a coverage limit. Among current Qwen models, it supports `qwen3.7-plus`. Qwen3.8-Max and Qwen3.8-Flash are not included. Older Qwen options on the supported list are `qwen3.6-plus` and `qwen3.5-plus`. This is a plan-coverage limit, not an endpoint limit: the pay-as-you-go route accepts the 3.8 models through its own Anthropic host.

The template sets a 983616 context window for both Qwen templates. If your Coding Plan rejects requests above 200K, lower `CLAUDE_CODE_MAX_CONTEXT_TOKENS` to `200000` in the instance settings. The plan's request quotas and context limits can change, so check the console before a long session.

## Pricing details

Qwen is pay-per-token on the standard route and a monthly subscription on the Coding Plan route. Singapore rates for the three models:

| Model | Input / 1M | Output / 1M |
|-------|-----------|-------------|
| Qwen3.8-Max | $2.00 | $6.00 |
| Qwen3.7-Plus, up to 256K input | $0.40 | $1.60 |
| Qwen3.7-Plus, above 256K input | $1.20 | $4.80 |
| Qwen3.8-Flash | $0.15 | $0.47 |

Standard rates vary by region. Singapore, Beijing, Frankfurt, Tokyo, and the US each have their own price sheet. Qwen3.7-Plus also prices input by length band, with the higher rate above 256K input tokens. Qwen3.8-Max and Qwen3.8-Flash use one rate at every input length.

Cache reads cost less than fresh input, and batch file jobs are discounted on some models and regions. Check [Alibaba Cloud Model Studio](https://www.alibabacloud.com/help/en/model-studio/models) for current rates. The template's per-token cost depends on the model IDs you use and the region your key belongs to.

## Where it fits

The Qwen template is a full 1M-context setup. Qwen3.8-Max handles complex reasoning and long-horizon coding, Qwen3.7-Plus covers most everyday work, and Qwen3.8-Flash handles completion and simple edits.

The Coding Plan is a fixed monthly route for interactive Claude Code use, but it stops at `qwen3.7-plus` among current Qwen models. If you need Qwen3.8-Max or Qwen3.8-Flash, use pay-as-you-go. If you have an older config that still names Qwen3-Coder-Next or Qwen3-Coder-Plus, move it to the current IDs; those two models are not on the Anthropic-compatible matrix.

## Related providers

- [DeepSeek](/providers/deepseek/) - pay-per-token, 1M context
- [GLM](/providers/glm/) - subscription plan, also a Chinese provider
- [MiniMax](/providers/minimax/) - 1M context, flash pricing
