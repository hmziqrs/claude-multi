---
question: "Is my API key stored safely?"
description: "API keys are stored in each instance's local settings.json file — never transmitted to claude-multi's servers. The tool runs entirely on your machine."
category: "Security"
order: 8
---

claude-multi stores your API keys **locally** in each instance's `settings.json` file. The tool itself has no backend, no telemetry, and no network calls.

## Where keys are stored

```
~/.claude-multi/<name>/settings.json
```

Each instance's settings file contains the provider environment variables, including `ANTHROPIC_AUTH_TOKEN` (your API key). The file is written with restrictive permissions.

## What claude-multi does with keys

- **Nothing.** claude-multi reads the key only to write it into the instance config. It never sends it anywhere.
- The key is passed to Claude Code via the `CLAUDE_CONFIG_DIR` mechanism — Claude Code reads it directly from the config file at runtime.
- claude-multi itself makes zero network requests during normal operation (only `version` checks npm for updates, which doesn't involve your API key).

## Atomic writes

Config files are written using an atomic temp-file-rename pattern with JSON verification. This prevents partial writes that could corrupt your config or leave a key in a broken state.

## Key storage best practices

- If you use the same key across providers, you can copy settings from your primary `~/.claude` during instance creation
- For different keys per provider, enter them individually during setup or edit `settings.json` directly
- You can inspect any instance's config by running `claude-multi info <name>` or browsing `~/.claude-multi/<name>/`

## References

| Resource | Link |
|----------|------|
| **Privacy policy** | [/privacy/](/privacy/) — data collection policy (website only, CLI collects nothing) |
| **About page** | [/about/](/about/) — "No daemons, no background services, no telemetry" |
| **Configuration docs** | [/docs/configuration/](/docs/configuration/) — settings.json schema |
| **In-app: Instance details** | Run `claude-multi`, select **Instance details** to see stored config |
| **GitHub: Atomic JSON writes** | [src/util/json-file.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/util/json-file.ts) — `writeJsonFileAtomic()` implementation |
| **GitHub: Config** | [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts) — how settings are created and stored |
