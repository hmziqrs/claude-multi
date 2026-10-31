---
question: "Is claude-multi a fork of Claude Code?"
description: "No, claude-multi wraps the unmodified claude binary. Each instance is a shell script that sets CLAUDE_CONFIG_DIR and delegates to the real Claude Code."
category: "Architecture"
order: 5
---

No. claude-multi doesn't fork, patch, or modify Claude Code. Each instance is a shell wrapper that sets `CLAUDE_CONFIG_DIR` to an isolated directory and then runs the real `claude` binary. No proxy, no monkey-patching, no background process.

Flags, commands, and keybindings work as they normally do, and Claude Code updates land immediately because every instance launches the same binary. The instance directory is real, so you can `cd` into it, inspect it, or delete it with standard tools.

The wrapper is a short script. On macOS and Linux it starts with `#!/bin/sh`; on Windows it is a `.cmd` file. The [how it works guide](/docs/how-it-works/) shows the script and the rest of the architecture.

#### What's inside an instance directory

By default, every instance lives under `~/.claude-<name>/`: a `settings.json` with provider env vars and merged settings, a `.claude.json` with instance-level Claude config, `plugins/` and `skills/` directories (symlinked or copied), and a `projects/` directory holding conversation history per project.

The registry, backups, health state, and migration lock live separately in `~/.claude-multi/`. They are not part of any instance's config.

Wrapper generation is in [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts).
