---
question: "Is claude-multi a fork of Claude Code?"
description: "No, claude-multi wraps the unmodified claude binary. Each instance is a shell script that sets CLAUDE_CONFIG_DIR and delegates to the real Claude Code."
category: "Architecture"
order: 5
---

No. claude-multi doesn't fork, patch, or modify Claude Code. Each instance is a shell wrapper script that sets `CLAUDE_CONFIG_DIR` to point at an isolated config directory, then execs the real `claude` binary. No proxy, no monkey-patching, no background process.

Flags, commands, and keybindings work exactly as they do normally, and Claude Code updates land immediately because you're running the actual binary. An instance is also a real directory you can `cd` into, inspect, or delete with standard tools.

For the wrapper script itself and the full architecture, see how it works.

## What's inside an instance directory

Every instance lives under `~/.claude-multi/<name>/`: a `settings.json` (provider env vars and merged settings), a `.claude.json` (instance-level Claude config), `plugins/` and `skills/` (symlinked or copied), and a `projects/` directory holding conversation history per project.

## Related questions

- [What is claude-multi?](/faq/#what-is-claude-multi): the full overview
- [How do I create a new instance?](/faq/#create-instance): getting started

## More info

- [/docs/how-it-works/](/docs/how-it-works/): architecture overview and wrapper script
- [/about/](/about/): the "wrapper, not a fork" explanation
- [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts): wrapper generation code
