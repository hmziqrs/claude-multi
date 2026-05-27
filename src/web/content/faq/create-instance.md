---
question: "How do I create a new instance for a provider?"
description: "Use the interactive TUI or the CLI add command to spin up an isolated Claude Code instance with a provider template in two commands."
category: "Usage"
order: 4
---

Two ways: the interactive TUI or a single CLI command.

## Interactive TUI

```sh
claude-multi
```

Pick **Add new instance** from the menu. You'll walk through these steps:

1. **Instance Name**, a short alias like `deepseek` or `glm`
2. **Provider Template**, choose from the list, or skip for a manual setup
3. **API Key**, paste your key (input is masked)
4. **Paths**, confirm the config directory and wrapper script locations
5. **Copy Options**, optionally copy settings from your primary `~/.claude` install
6. **Select Plugins**, pick which plugins to bring over
7. **Auto-Sync**, turn on symlink-based plugin syncing from `~/.claude`

The instance is created and you're back at the menu.

## CLI command

```sh
claude-multi add deepseek --provider deepseek --api-key sk-your-key
```

Available flags:

| Flag | What it does |
|------|-------------|
| `--provider <name>` | Template to use (glm, minimax, deepseek, mimo, kimi, qwen, etc.) |
| `--api-key <key>` | API key for the provider |
| `--copy-settings` | Copy settings from `~/.claude` |
| `--copy-plugins` | Copy plugins from `~/.claude` |
| `--copy-mcp` | Copy MCP server configs from `~/.claude` |
| `--auto-sync` | Enable auto-sync for plugins and skills |

## What happens under the hood

Four things:

1. A directory is created at `~/.claude-multi/<name>/` with its own `settings.json` and `.claude.json`
2. Provider env vars (base URL, model mappings) are merged into the instance settings
3. If auto-sync is on, plugins and skills get symlinked from `~/.claude`
4. A wrapper script is generated that sets `CLAUDE_CONFIG_DIR` and execs the real `claude` binary

After that, run `claude-<name>` (e.g. `claude-deepseek`) to launch Claude Code with that provider.

## Related questions

- [How does plugin syncing work?](/faq/plugin-syncing/): keep plugins in sync across instances
- [How do I manage MCP servers?](/faq/mcp-servers/): copy MCP configs to new instances
- [How do I remove an instance?](/faq/remove-instance/): the reverse of this process

## More info

- [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/): detailed walkthrough of the creation wizard
- [/docs/getting-started/](/docs/getting-started/): first instance setup
- [/docs/usage/](/docs/usage/): full CLI reference
- Run `claude-multi` and select **Add new instance** to try it
- [src/ink/screens/AddInstance.tsx](https://github.com/hmziqrs/claude-multi/blob/master/src/ink/screens/AddInstance.tsx): the TUI wizard code
- [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts): `addInstance()` implementation
- [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts): wrapper generation
