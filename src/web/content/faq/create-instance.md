---
question: "How do I create a new instance for a provider?"
description: "Use the interactive TUI or the CLI add command to spin up an isolated Claude Code instance with a provider template in two commands."
category: "Usage"
order: 4
---

Two ways: the interactive TUI, or a single CLI command.

## Interactive TUI

```sh
claude-multi
```

Pick **Add new instance**. The wizard walks through instance name, provider template, API key, paths, copy options, plugin selection, and sync mode. The instance is created and you're back at the menu.

## CLI command

```sh
claude-multi add deepseek --provider deepseek --api-key sk-your-key
```

The `add` command takes `--provider`, `--api-key`, and a set of copy and sync flags (`--copy-settings`, `--copy-plugins`, `--copy-mcp`, `--sync-mode`). See the CLI reference for the full set.

After that, run `claude-<name>` (e.g. `claude-deepseek`) to launch Claude Code with that provider.

## Related questions

- [How does plugin syncing work?](/faq/#plugin-syncing): keep plugins in sync across instances
- [How do I manage MCP servers?](/faq/#mcp-servers): copy MCP configs to new instances
- [How do I remove an instance?](/faq/#remove-instance): the reverse of this process

## More info

- [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/): detailed walkthrough of the creation wizard
- [/docs/getting-started/](/docs/getting-started/): first instance setup
- [/docs/usage/](/docs/usage/): full CLI reference and flags
