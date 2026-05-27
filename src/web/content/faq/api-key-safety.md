---
question: "Is my API key stored safely?"
description: "API keys are stored in each instance's local settings.json file — never transmitted to claude-multi's servers. The tool runs entirely on your machine."
category: "Security"
order: 8
---

Your API keys stay on your machine. claude-multi has no backend, no telemetry, and makes no network calls during normal operation.

## Where keys end up

Each instance stores its key in `~/.claude-multi/<name>/settings.json` as part of the `ANTHROPIC_AUTH_TOKEN` env var. When you launch that instance, Claude Code reads the key directly from the config file — claude-multi isn't involved at runtime.

The only time claude-multi touches your key is during instance creation, when it writes it into the settings file. After that, it's between you and Claude Code.

## About those config writes

Settings files are written using a temp-file-rename pattern with JSON verification. The file gets written to a temp path, verified as valid JSON, then atomically renamed into place. No partial writes, no corrupted configs.

## Practical tips

- If you use the same key across providers, you can copy settings from `~/.claude` during instance creation instead of re-entering it
- For different keys per provider, enter them individually during setup or edit the settings file directly
- Run `claude-multi info <name>` to see what's stored for any instance
- The `version` subcommand checks npm for updates, but that's the only network call claude-multi ever makes, and it doesn't involve your API key

## More info

- [/privacy/](/privacy/) — data collection policy (website only — the CLI collects nothing)
- [/about/](/about/) — "no daemons, no background services, no telemetry"
- [/docs/configuration/](/docs/configuration/) — settings.json schema
- [src/util/json-file.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/util/json-file.ts) — atomic write implementation
- [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts) — how settings are created and stored
