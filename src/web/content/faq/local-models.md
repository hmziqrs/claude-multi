---
question: "Can I use it with local models like Ollama?"
description: "Any provider that exposes an Anthropic-compatible REST API works, including local setups like Ollama with the right adapter."
category: "Providers"
order: 16
---

Yes, as long as your local model server exposes an Anthropic-compatible REST endpoint. Claude Code speaks the Anthropic API protocol, so the server on the other end needs to understand that format.

## How to set it up

Create an instance without a template:

```sh
claude-multi add local
```

Then edit `~/.claude-multi/local/settings.json` and set the env vars to point at your local server:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:11434/v1",
    "ANTHROPIC_MODEL": "your-model-name",
    "ANTHROPIC_SMALL_FAST_MODEL": "your-fast-model"
  }
}
```

Replace the URL and model names with whatever your local server exposes.

## What works and what doesn't

If your local server implements the Anthropic messages API (the `/v1/messages` endpoint), Claude Code will work with it. [Ollama](https://ollama.ai) with an Anthropic-compatible adapter, [LiteLLM](https://github.com/BerriAI/litellm), or [vLLM](https://github.com/vllm-project/vllm) behind the right proxy can bridge the gap.

The further your local setup drifts from the Anthropic API spec, the more edge cases you hit. Streaming and tool use are usually where it breaks first.

## A practical note on cost

Local models have no per-token API cost. You pay in compute instead: GPU time and electricity. If you already have the hardware, that can work out cheaper for high-volume work like code generation and refactoring.

## Related questions

- [Which providers are supported?](/faq/#supported-providers): the built-in templates
- [How do I create a new instance?](/faq/#create-instance): the full setup walkthrough

## More info

- [/providers/](/providers/): template reference and env var details
- [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts): see how templates set `ANTHROPIC_BASE_URL` and model mappings for reference
