---
title: "How to Run Claude Code with Multiple AI Providers"
description: "Set up two or more provider instances and switch between them in seconds. One tool, multiple backends, zero config editing."
difficulty: "Beginner"
timeRequired: "5 min"
prerequisites:
  - "Node.js 18 or later installed"
  - "At least one API key (GLM, DeepSeek, MiniMax, or any supported provider)"
relatedProviders:
  - "GLM"
  - "DeepSeek"
  - "MiniMax"
order: 1
---

claude-multi lets you run Claude Code against any OpenAI-compatible provider. Each provider gets its own isolated instance with its own config, its own API key, and its own terminal command. This guide walks through setting up two providers and switching between them.

## Install claude-multi

```bash
npm install -g claude-multi
```

That gives you the `claude-multi` command, which opens the TUI where you manage all your instances.

## Add your first provider

Open the TUI:

```bash
claude-multi
```

Select **Add new instance**. The wizard asks for:

1. **Instance name** -- something short, like `glm` or `deepseek`
2. **Template** -- pick from the list of supported providers
3. **API key** -- paste it when prompted (masked input)

The template pre-configures the base URL, model name, environment variables, and output limits. You do not need to edit any config files by hand.

```bash
# Example: adding GLM
claude-multi
# Add new instance
# Name: glm
# Template: glm
# Paste API key: sk-...
```

After setup finishes, you get a `claude-glm` command in your shell.

## Add a second provider

Run the TUI again and add another instance:

```bash
claude-multi
# Add new instance
# Name: deepseek
# Template: deepseek
# Paste API key: ...
```

Now you have two commands:

```bash
claude-glm       # runs Claude Code with GLM
claude-deepseek  # runs Claude Code with DeepSeek
```

Both use the same Claude Code interface. The only difference is which provider handles the requests.

## Verify both work

```bash
claude-glm "what provider am I connected to?"
claude-deepseek "what provider am I connected to?"
```

Each session should respond with information about its respective provider.

## Where the config lives

Each instance gets its own directory:

| Path | Contents |
|------|----------|
| `~/.claude-glm/` | GLM instance config, plugins, history |
| `~/.claude-deepseek/` | DeepSeek instance config, plugins, history |
| `~/.local/bin/claude-glm` | Wrapper script for the GLM instance |
| `~/.local/bin/claude-deepseek` | Wrapper script for the DeepSeek instance |

Settings are in `~/.claude-<name>/settings.json`. You can edit them directly or use the TUI.

## Share plugins across instances

During setup, you can enable **auto-sync**. This symlinks plugins from your main `~/.claude` directory so every instance shares the same tools. Changes propagate instantly.

```bash
claude-multi
# Pick: Toggle auto-sync
# Select: glm
# Select: deepseek
```

Or skip it and manage plugins per instance if you prefer isolation.

## Next steps

- [Switch between providers without editing config](/guides/switch-providers/)
- [Set up MCP servers](/guides/mcp-server-setup/)
- [Optimize costs with provider routing](/guides/cost-optimization/)
