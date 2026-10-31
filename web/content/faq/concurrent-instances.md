---
question: "Can I run multiple instances at the same time?"
description: "Yes. Launch claude-glm and claude-deepseek in separate terminals and they run independently with no conflicts."
category: "Usage"
order: 12
---

Yes. Open two terminals and run different aliases:

```sh
# Terminal 1
claude-deepseek

# Terminal 2
claude-glm
```

Each instance has its own config directory, so settings, conversation history, and MCP servers stay separate. You can point two instances at the same provider if you want isolated contexts for different projects.

Instances don't share config or conversation state, so there are no per-instance lock files or port conflicts. Each `claude-<name>` wrapper sets `CLAUDE_CONFIG_DIR` and launches the real `claude` binary. The [how it works guide](/docs/how-it-works/) covers the wrapper and common multi-instance workflows.

If you want both instances to share plugins, enable auto-sync on each. If you want them isolated, leave sync in full-manual mode. The [plugin syncing answer](/faq/#plugin-syncing) covers the modes.
