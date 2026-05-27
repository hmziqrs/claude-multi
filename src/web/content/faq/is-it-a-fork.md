---
question: "Is claude-multi a fork of Claude Code?"
description: "No — claude-multi wraps the unmodified claude binary. Each instance is a shell script that sets CLAUDE_CONFIG_DIR and delegates to the real Claude Code."
category: "Architecture"
order: 5
---

**No.** claude-multi does not fork, patch, or modify the Claude Code binary in any way.

## How it actually works

Each instance is a thin **shell wrapper script** (or batch file on Windows) that does two things:

1. Sets the `CLAUDE_CONFIG_DIR` environment variable to point at the instance's directory
2. `exec`s the real `claude` binary

The wrapper looks like this (simplified):

```sh
#!/bin/sh
export CLAUDE_CONFIG_DIR="$HOME/.claude-multi/deepseek"
exec claude "$@"
```

That's the entire trick. No proxy, no monkey-patching, no daemon. Claude Code reads its config from `CLAUDE_CONFIG_DIR` instead of the default `~/.claude`, and everything else works identically — every flag, every command, every keybinding.

## Why this matters

- **Updates just work** — when Claude Code updates, you get the new version immediately
- **Zero compatibility risk** — nothing is modified, so nothing can break from upstream changes
- **Full feature parity** — every Claude Code feature works because you're running the real Claude Code
- **Inspection** — every instance is a real directory you can `cd` into and inspect

## What lives in each instance directory

```
~/.claude-multi/deepseek/
├── settings.json        # Provider env vars + merged settings
├── .claude.json         # Instance-level Claude config
├── plugins/             # Symlinked or copied plugins
├── skills/              # Symlinked or copied skills
└── projects/            # Conversation history per project
```

## References

| Resource | Link |
|----------|------|
| **About page** | [/about/](/about/) — "A wrapper, not a fork" section |
| **How it works docs** | [/docs/how-it-works/](/docs/how-it-works/) — architecture overview |
| **In-app: Instance details** | Run `claude-multi`, select **Instance details** on any instance to see its directory, wrapper path, and config |
| **GitHub: Wrapper** | [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts) — the wrapper generation code |
| **GitHub: Config** | [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts) — how instance directories are created |
