---
question: "Which AI providers are supported?"
description: "claude-multi ships 8 templates covering GLM, MiniMax, DeepSeek, Xiaomi MiMo, Moonshot Kimi, and Alibaba Qwen, each with pre-configured endpoints and model mappings."
category: "Providers"
order: 3
---

Each provider is a template: a bundle of environment variables (base URL, model mappings, default settings) merged into a new instance. You bring the API key; the template handles the rest. The full list, with endpoints and model mappings for all eight templates, lives on the providers page.

## Using Anthropic directly

You don't need a template for Anthropic, that's Claude Code's default. Run `claude` directly for Anthropic, and use claude-multi for everything else. If you still want a managed instance for Anthropic (to keep its config isolated), create one without a provider:

```sh
claude-multi add anthropic --skip-prompts
```

It connects to Anthropic's API using Claude Code's built-in defaults.

## Using a provider that's not listed

You can create an instance without a template and configure it manually:

```sh
claude-multi add my-provider
# Then edit ~/.claude-multi/my-provider/settings.json
```

Set `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, and `ANTHROPIC_SMALL_FAST_MODEL` to match your provider's API.

## Related questions

- [How do I create a new instance?](/faq/#create-instance): the actual setup steps
- [Can I use local models like Ollama?](/faq/#local-models): any Anthropic-compatible API works

## More info

- [/providers/](/providers/): full template reference with model mappings and endpoints
- [/blog/kimi-k27-three-tier-agentic-coding/](/blog/kimi-k27-three-tier-agentic-coding/): Kimi K2.7 Code benchmarks and tier mapping
- [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts): template definitions
