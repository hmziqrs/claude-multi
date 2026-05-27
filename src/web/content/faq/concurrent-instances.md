---
question: "Can I run multiple instances at the same time?"
description: "Yes, that's the whole point. Launch claude-glm and claude-deepseek in separate terminals and they run independently with no conflicts."
category: "Usage"
order: 12
---

Yes. Open two (or more) terminals and run different aliases:

```sh
# Terminal 1
claude-deepseek

# Terminal 2
claude-glm
```

Each instance has its own config directory, so they don't interfere with each other. Separate settings, separate conversation history, separate MCP servers. You can even point two instances at the same provider if you want isolated contexts for different projects.

## Why this works

There's no shared state between instances. No lock files, no central server, no port conflicts. Each `claude-<name>` command is just a shell script that sets `CLAUDE_CONFIG_DIR` and launches the real `claude` binary. Two instances are as independent as two copies of Claude Code running in different directories.

## Practical uses

- Run a cheap model (DeepSeek Flash) for quick questions while a powerful model (Claude Opus) handles a complex task
- Keep work and personal instances with different MCP servers and plugins
- Test the same prompt across providers side by side to compare output quality

## Related questions

- [What is claude-multi?](/faq/what-is-claude-multi/): the full overview
- [Which providers are supported?](/faq/supported-providers/): pick your models
