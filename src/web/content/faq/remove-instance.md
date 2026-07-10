---
question: "How do I remove an instance?"
description: "Use claude-multi remove <name> or the TUI Remove option. The config directory is kept on disk so you can decide whether to delete it."
category: "Usage"
order: 15
---

From the CLI:

```sh
claude-multi remove deepseek
```

Or use the alias:

```sh
claude-multi rm deepseek
```

From the TUI, select **Remove instance** and pick which one.

## What gets removed

The remove command does two things:
1. Removes the instance from claude-multi's registry (`~/.claude-multi/config.json`)
2. Deletes the wrapper script (e.g. `~/.local/bin/claude-deepseek`)

It does **not** delete the config directory (`~/.claude-multi/deepseek/`). This is intentional, your conversation history lives there, and you might want to keep it.

## Deleting the config directory

After removing the instance, you'll see a hint:

```
To remove config files, run: rm -rf ~/.claude-multi/deepseek
```

Run that if you're sure you don't need the history. Skip it if you might want to recreate the instance later with the same conversation context.

## Removing in scripts or CI

Use `--force` to skip the confirmation prompt:

```sh
claude-multi remove deepseek --force
```

## Related questions

- [How do I create a new instance?](/faq/#create-instance): recreate after removing
- [How do I troubleshoot broken instances?](/faq/#troubleshooting): when removal is part of the fix

## More info

- [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/): Remove instance section
- [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts): `removeInstance()` implementation
- [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts): `removeWrapper()` implementation
- [src/ink/screens/RemoveInstance.tsx](https://github.com/hmziqrs/claude-multi/blob/master/src/ink/screens/RemoveInstance.tsx): TUI remove screen
- Run `claude-multi` and select **Remove instance**
