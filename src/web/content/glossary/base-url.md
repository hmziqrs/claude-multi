---
title: "Base URL"
description: "The API endpoint URL that Claude Code sends requests to. Each provider template sets a different base URL to route traffic to the right service."
term: "Base URL"
category: "Configuration"
related:
  - "api-key"
  - "provider-template"
  - "model-mapping"
  - "wrapper-script"
---

The base URL is the API endpoint that Claude Code communicates with. By default, Claude Code points at Anthropic's API. Provider templates change this URL to point at other Anthropic-compatible endpoints.

## How it works

Claude Code uses the `ANTHROPIC_BASE_URL` environment variable to decide where to send requests. When you run a claude-multi instance, the wrapper script sets this variable to the provider's endpoint.

Examples:

- **GLM**: `https://api.z.ai/api/anthropic`
- **MiniMax**: `https://api.minimax.io/anthropic`
- **DeepSeek**: `https://api.deepseek.com/beta/anthropic`
- **OpenRouter**: `https://openrouter.ai/api/anthropic`
- **Anthropic** (default): `https://api.anthropic.com`

## Why providers use Anthropic-compatible endpoints

Many providers expose an Anthropic-compatible API so tools built for Claude Code work without modification. The base URL swap is the only change needed. The request format, authentication header, and response parsing all stay the same.

## Changing it

You can change the base URL by editing the wrapper script or the instance's `settings.json`. This is useful if a provider changes their endpoint or if you're running a local proxy.

## Relationship to model mapping

The base URL determines which provider receives the request. The model mapping determines which model name is sent in that request. Both are set by the provider template and stored in the wrapper script.
