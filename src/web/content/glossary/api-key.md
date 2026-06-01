---
title: "API Key"
description: "The authentication token that identifies your account with an LLM provider. Each claude-multi instance stores its own API key in its config directory."
term: "API Key"
category: "Configuration"
related:
  - "base-url"
  - "provider-template"
  - "config-directory"
  - "instance-isolation"
---

An API key is a secret token that authenticates your requests to an LLM provider. Without it, the provider rejects your calls. Each claude-multi instance can use a different API key.

## Where it's stored

claude-multi stores the API key in the instance's `settings.json` inside its config directory. It's also exported as an environment variable by the wrapper script so Claude Code can read it at runtime.

## Per-instance keys

Because each instance has its own config directory, you can use different API keys for different providers. Your GLM instance uses your GLM key. Your DeepSeek instance uses your DeepSeek key. No conflict, no manual switching.

## Security

API keys are stored in plain text in the config directory, same as Claude Code's native behavior. Don't commit your config directory to version control. Don't share your `settings.json` files.

## Setting a key

When you create an instance through the TUI, claude-multi prompts you for the API key. You can also set it later by editing the instance's `settings.json` or the wrapper script directly.

## Key rotation

To rotate a key, update it in the wrapper script and in the instance's `settings.json`. The change takes effect on the next session start.
