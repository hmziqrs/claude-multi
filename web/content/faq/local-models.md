---
question: "Can I use it with local models like Ollama?"
description: "Any provider that exposes an Anthropic-compatible REST API works, including Ollama's Anthropic-compatible endpoint and local proxies."
category: "Providers"
order: 16
---

Yes, if your local model server exposes an Anthropic-compatible endpoint. Claude Code speaks the Anthropic API protocol.

#### How to set it up

Create an instance without a template:

```sh
claude-multi add local --skip-prompts
```

Then create or edit `~/.claude-local/settings.json` and add the env vars:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:11434",
    "ANTHROPIC_MODEL": "your-model-name",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "your-fast-model"
  }
}
```

Replace the URL and model names with what your server exposes. Use the base URL for its Anthropic API. Claude Code appends `/v1/messages` to it. Provider templates show how base URLs and model mappings are set in [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts).

#### What works

If your server implements the Anthropic messages API, Claude Code can use it. [Ollama](https://docs.ollama.com/api/anthropic-compatibility) supports a subset of that API from v0.14.0, so it can serve Claude Code directly. [LiteLLM](https://github.com/BerriAI/litellm) can proxy many backends behind an Anthropic-compatible API. [vLLM](https://github.com/vllm-project/vllm) serves an OpenAI-compatible API, so put a translation proxy in front of it.

The further your setup drifts from the Anthropic API spec, the more edge cases you hit. Streaming and tool use usually break first.

#### Cost

Local models have no per-token API cost. You pay in compute: GPU time and electricity. If you already own the hardware, that can be cheaper for high-volume work such as code generation and refactoring.
