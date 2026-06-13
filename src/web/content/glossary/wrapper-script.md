---
title: "Wrapper Script"
description: "A small shell script that sets environment variables for a specific provider and then launches Claude Code, giving each instance its own identity."
term: "Wrapper Script"
category: "Architecture"
related:
  - "config-directory"
  - "provider-template"
  - "instance-isolation"
  - "api-key"
  - "base-url"
---

A wrapper script is a generated shell script that acts as the entry point for a claude-multi instance. It sets the right environment variables and then runs Claude Code.

## What it does

When you run `claude-glm` (for example), the wrapper script:

1. Sets `CLAUDE_CONFIG_DIR` to `~/.claude-multi/glm/`
2. Exports the provider's environment variables (API key, base URL, model names, timeouts)
3. Runs the `claude` binary

That's it. No daemon, no proxy, no background process. Just environment setup and a binary call.

## Where it lives

Wrapper scripts are installed to `/usr/local/bin/claude-<name>` by default. This path is in your `$PATH`, so you can run `claude-glm` or `claude-deepseek` from any terminal.

## How it's generated

When you create an instance through the TUI or CLI, claude-multi generates the wrapper script based on the provider template. The template defines which environment variables to set. The wrapper script is written to disk and made executable.

## Customization

You can edit a wrapper script directly to change environment variables without touching the TUI. Just open `/usr/local/bin/claude-<name>` in any editor. Changes take effect on the next run.

## What it looks like

A simplified example:

```sh
#!/bin/bash
export CLAUDE_CONFIG_DIR="$HOME/.claude-multi/glm"
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_MODEL="glm-5.2[1m]"
exec claude "$@"
```

The `exec` replaces the shell process with Claude Code, so signals and exit codes pass through cleanly.
