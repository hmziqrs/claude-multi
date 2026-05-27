---
question: "Is claude-multi a fork of Claude Code?"
description: "No, claude-multi wraps the unmodified claude binary. Each instance is a shell script that sets CLAUDE_CONFIG_DIR and delegates to the real Claude Code."
category: "Architecture"
order: 5
---

No. It doesn't fork, patch, or modify Claude Code in any way.

## The actual mechanism

Each instance is a shell wrapper script (batch file on Windows) that does two things: set `CLAUDE_CONFIG_DIR` to the instance's directory, then `exec` the real `claude` binary. Simplified:

```sh
#!/bin/sh
export CLAUDE_CONFIG_DIR="$HOME/.claude-multi/deepseek"
exec claude "$@"
```

That's it. No proxy, no monkey-patching, no background process. Claude Code reads its config from the pointed-to directory instead of `~/.claude`, and everything else, flags, commands, keybindings, works exactly as it does normally.

## Why this matters in practice

When Claude Code ships an update, you get it immediately. There's nothing to rebase or merge. Every feature works because you're running the actual binary. And each instance is a real directory you can `cd` into, inspect, or delete with standard tools.

## What's inside an instance directory

```
~/.claude-multi/deepseek/
├── settings.json        # provider env vars + merged settings
├── .claude.json         # instance-level Claude config
├── plugins/             # symlinked or copied plugins
├── skills/              # symlinked or copied skills
└── projects/            # conversation history per project
```

## Related questions

- [What is claude-multi?](/faq/what-is-claude-multi/): the full overview
- [How do I create a new instance?](/faq/create-instance/): getting started

## More info

- [/about/](/about/): the "wrapper, not a fork" explanation
- [/docs/how-it-works/](/docs/how-it-works/): architecture overview
- Run `claude-multi`, pick an instance, select **Instance details** to see its directory, wrapper path, and config
- [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts): wrapper generation code
- [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts): how instance directories are created
