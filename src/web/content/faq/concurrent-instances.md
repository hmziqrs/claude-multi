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

Each instance has its own config directory, so settings, conversation history, and MCP servers stay separate. You can even point two instances at the same provider if you want isolated contexts for different projects.

Instances share no state, so there are no lock files or port conflicts to worry about. Each `claude-<name>` command just sets `CLAUDE_CONFIG_DIR` and launches the real `claude` binary. For why that's safe and the common multi-instance workflows, see how it works.

## Related questions

- [What is claude-multi?](/faq/#what-is-claude-multi): the full overview
- [Which providers are supported?](/faq/#supported-providers): pick your models
