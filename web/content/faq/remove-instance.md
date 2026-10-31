---
question: "How do I remove an instance?"
description: "Use claude-multi remove <name> or the TUI Remove option. It leaves the config directory on disk so you decide whether to delete it."
category: "Usage"
order: 15
---

From the CLI:

```sh
claude-multi remove deepseek
```

Or the alias:

```sh
claude-multi rm deepseek
```

From the TUI, select **Remove instance** and pick one.

#### What gets removed

The command removes the instance from the registry at `~/.claude-multi/config.json` and deletes the wrapper script (for example `~/.local/bin/claude-deepseek`).

It does not delete the config directory `~/.claude-deepseek/`. That is deliberate. Conversation history lives there, and you might want to keep it.

#### Deleting the config directory

After removal, the CLI prints the exact command:

```
To remove config files, run: rm -rf ~/.claude-deepseek
```

Run it only if you do not need the history. Skip it if you might recreate the instance with the same conversation context.

#### Scripts and CI

`--force` skips the printed summary:

```sh
claude-multi remove deepseek --force
```

The flag does not delete the config directory either.

The [troubleshooting guide](/docs/troubleshooting/) covers removal when it is part of a repair. The implementation is in [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts) and [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts).
