---
question: "How do I create a new instance for a provider?"
description: "Use the interactive TUI or the CLI add command to create an isolated Claude Code instance with a provider template."
category: "Usage"
order: 4
---

Two ways: the TUI or one CLI command.

#### Interactive TUI

```sh
claude-multi
```

Pick **Add new instance**. The wizard asks for a name, provider template, API key, and path confirmation. Depending on the copy option, it also asks which plugins to include and which sync mode to use. When it finishes, you are back at the menu with the instance created.

#### CLI command

```sh
claude-multi add deepseek --provider deepseek --api-key sk-your-key
```

`--api-key` is required with `--provider`. The `add` command also takes `--copy-settings`, `--copy-all`, `--copy-mcp`, and one sync flag (`--auto-sync`, `--half-manual`, `--manual`, or `--sync-mode <mode>`). The [CLI reference](/docs/usage/) lists every option.

After creation, run `claude-deepseek`. The wrapper sets `CLAUDE_CONFIG_DIR` to `~/.claude-deepseek` and launches Claude Code.

See [plugin syncing](/faq/#plugin-syncing) for the sync modes and [MCP servers](/faq/#mcp-servers) for copying MCP configs.
