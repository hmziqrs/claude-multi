---
question: "Which AI providers are supported?"
description: "claude-multi ships 8 templates covering Anthropic, GLM, MiniMax, DeepSeek, Xiaomi MiMo, Moonshot Kimi, and Alibaba Qwen — each with pre-configured endpoints and model mappings."
category: "Providers"
order: 3
---

Every provider in claude-multi is a **template** — a bundle of environment variables (base URL, model mappings, default settings) that gets merged into a new instance's config. You bring the API key; the template handles the rest.

## Provider table

| Template | Provider | Models | Endpoint |
|----------|----------|--------|----------|
| `anthropic` | Anthropic | Claude Opus, Sonnet, Haiku | api.anthropic.com |
| `glm` | GLM Coding Plan | GLM-5.1, GLM-5-Turbo | api.z.ai |
| `minimax` | MiniMax | MiniMax-M2.7 | api.minimax.io |
| `deepseek` | DeepSeek | DeepSeek-V4-Pro, V4-Flash | api.deepseek.com |
| `mimo` | Xiaomi MiMo (Pay-per-token) | MiMo-V2.5-Pro, V2.5 | api.xiaomimimo.com |
| `mimo-token` | Xiaomi MiMo (Subscription) | MiMo-V2.5-Pro | token-plan-cn.xiaomimimo.com |
| `kimi` | Moonshot Kimi | Kimi K2.6, K2.5 | api.moonshot.ai |
| `qwen` | Alibaba Qwen (Pay-per-token) | Qwen3-Coder-Next/Plus/Flash | dashscope-intl.aliyuncs.com |
| `qwen-coding` | Alibaba Qwen (Coding plan) | Qwen3-Coder-Next/Plus/Flash | coding-intl.dashscope.aliyuncs.com |

## The plan-split problem

Some providers (Xiaomi, Alibaba) run separate endpoints for pay-per-token vs. subscription plans. claude-multi ships separate templates for each — for example `mimo` vs. `mimo-token` — so you don't have to manually edit URLs after setup.

## Adding a custom provider

If your provider isn't in the template list, you can create an instance and manually set the environment variables in `settings.json`:

```sh
claude-multi add my-provider
# Then edit ~/.claude-multi/my-provider/settings.json
```

Set `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, and `ANTHROPIC_SMALL_FAST_MODEL` to match your provider's API.

## References

| Resource | Link |
|----------|------|
| **Providers docs** | [/docs/providers/](/docs/providers/) — full template reference with model mappings |
| **Blog: Five new templates** | [/blog/five-new-provider-templates/](/blog/five-new-provider-templates/) — announcement of MiMo, Kimi, Qwen support |
| **Blog: Claude Code co-engineer** | [/blog/claude-code-co-engineer-and-claude-multi/](/blog/claude-code-co-engineer-and-claude-multi/) — LLM routing and cost optimization |
| **In-app: Instance creation** | Run `claude-multi` and select **Add new instance** — the provider picker shows all available templates |
| **GitHub: Templates** | [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts) — template definitions with env vars and model mappings |
