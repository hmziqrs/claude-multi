---
question: "Which AI providers are supported?"
description: "claude-multi ships eight templates across six providers: GLM, MiniMax, DeepSeek, Xiaomi MiMo, Kimi, and Qwen. Each template sets the endpoint and model mappings."
category: "Providers"
order: 3
---

A provider template bundles environment variables (base URL, model mappings, default settings) that claude-multi merges into a new instance. You bring the API key. There are six providers and eight templates:

- GLM
- MiniMax
- DeepSeek
- Xiaomi MiMo, with pay-as-you-go and Token Plan variants
- Kimi
- Qwen, with pay-as-you-go and Coding Plan variants

The MiMo and Qwen entries are plan variants, not separate providers. The `--provider` values are `glm`, `minimax`, `deepseek`, `mimo`, `mimo-token`, `kimi`, `qwen`, and `qwen-coding`. The [providers page](/providers/) lists endpoints and model mappings for all eight.

#### Using Anthropic directly

You don't need a template for Anthropic. That is Claude Code's default. Run `claude` for Anthropic and use claude-multi for everything else. If you want an isolated config directory for Anthropic anyway:

```sh
claude-multi add anthropic --skip-prompts
```

It uses Claude Code's default Anthropic endpoint.

#### Using a provider that's not listed

Create an instance without a template and configure it yourself:

```sh
claude-multi add my-provider --skip-prompts
```

Then create or edit `~/.claude-my-provider/settings.json` and set `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, `ANTHROPIC_DEFAULT_FABLE_MODEL`, and `ANTHROPIC_DEFAULT_HAIKU_MODEL`. If the provider supports effort levels, also set `CLAUDE_CODE_EFFORT_LEVEL` and `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1`. The [configuration guide](/docs/configuration/) documents the settings format. Template definitions are in [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts).
