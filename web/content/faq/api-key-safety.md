---
question: "Is my API key stored safely?"
description: "API keys are stored in each instance's local settings.json file. claude-multi has no backend and does not collect them."
category: "Security"
order: 8
---

Your API keys stay on your machine. claude-multi has no backend and no telemetry. The tool itself does not send your key anywhere.

#### Where keys end up

Provider templates store the key in `~/.claude-<name>/settings.json` as `ANTHROPIC_AUTH_TOKEN` in the `env` block. When you launch that instance, Claude Code reads the key from the config file. claude-multi is not involved at runtime.

Provider setup writes the key once, during instance creation. After that, the key is between you and Claude Code. It is plain text in the file, so normal file permissions are the protection. Keep backups of the instance directory private.

`--api-key` on the command line is convenient, but the key lands in your shell history. On a shared machine, create the instance through the TUI or edit `settings.json` after creation.

#### Atomic config writes

claude-multi writes settings files with a temp-file-rename pattern. It writes to a temp path, checks that the result parses as JSON, then renames it into place. If the write fails partway, the existing config is untouched. The implementation is in [src/util/json-file.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/util/json-file.ts).

#### Network calls

The update check fetches version metadata from the npm registry. That is the only network request claude-multi makes itself, and it does not include your API key. `claude-multi info <name>` prints the instance's config path, binary path, sync mode, version, and provider. It does not print the key.

The [configuration guide](/docs/configuration/) documents the settings format, and instance creation is in [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts).
