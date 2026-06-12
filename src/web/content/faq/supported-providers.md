---
question: "Which AI providers are supported?"
description: "claude-multi ships 8 templates covering GLM, MiniMax, DeepSeek, Xiaomi MiMo, Moonshot Kimi, and Alibaba Qwen, each with pre-configured endpoints and model mappings."
category: "Providers"
order: 3
---

Each provider is a template, a bundle of environment variables (base URL, model mappings, default settings) that gets merged into a new instance. You bring the API key; the template handles the rest.

## All available templates

| Template | Provider | Models | Endpoint |
|----------|----------|--------|----------|
| `glm` | GLM Coding Plan | GLM-5.1, GLM-5-Turbo | api.z.ai |
| `minimax` | MiniMax | MiniMax-M3 | api.minimax.io |
| `deepseek` | DeepSeek | DeepSeek-V4-Pro, V4-Flash | api.deepseek.com |
| `mimo` | Xiaomi MiMo (pay-per-token) | MiMo-V2.5-Pro, V2.5 | api.xiaomimimo.com |
| `mimo-token` | Xiaomi MiMo (subscription) | MiMo-V2.5-Pro | token-plan-cn.xiaomimimo.com |
| `kimi` | Moonshot Kimi | Kimi K2.7, K2.6, K2.5 | api.moonshot.ai |
| `qwen` | Alibaba Qwen (pay-per-token) | Qwen3-Coder-Next/Plus/Flash | dashscope-intl.aliyuncs.com |
| `qwen-coding` | Alibaba Qwen (coding plan) | Qwen3-Coder-Next/Plus/Flash | coding-intl.dashscope.aliyuncs.com |

## Why some providers have two templates

Xiaomi and Alibaba run separate endpoints for pay-per-token vs. subscription plans. Rather than making you edit URLs after setup, claude-multi ships a template for each, `mimo` vs. `mimo-token`, `qwen` vs. `qwen-coding`.

## Using Anthropic directly

You don't need a template for Anthropic, that's just Claude Code's default. Run `claude` directly for Anthropic, and use claude-multi for everything else. If you still want a managed instance for Anthropic (to keep its config isolated), create one without a provider:

```sh
claude-multi add anthropic --skip-prompts
```

It'll connect to Anthropic's API using Claude Code's built-in defaults.

## Using a provider that's not listed

You can create an instance without a template and configure it manually:

```sh
claude-multi add my-provider
# Then edit ~/.claude-multi/my-provider/settings.json
```

Set `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, and `ANTHROPIC_SMALL_FAST_MODEL` to match your provider's API.

## Related questions

- [How do I create a new instance?](/faq/create-instance/): the actual setup steps
- [Can I use local models like Ollama?](/faq/local-models/): any Anthropic-compatible API works

## More info

- [/docs/providers/](/docs/providers/): full template reference with model mappings
- [/blog/five-new-provider-templates/](/blog/five-new-provider-templates/): the MiMo, Kimi, Qwen announcement
- [/blog/claude-code-co-engineer-and-claude-multi/](/blog/claude-code-co-engineer-and-claude-multi/): cost optimization with LLM routing
- Run `claude-multi` and select **Add new instance** to see all templates in the picker
- [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts): template definitions
