---
title: Contributing
description: Development setup and contribution guide
---

## Prerequisites

- [Bun](https://bun.sh/) 1+ (primary runtime for development)
- [Claude Code](https://www.npmjs.com/package/@anthropic-ai/claude-code) installed globally
- [Git](https://git-scm.com/)

## Clone and install

```bash
git clone https://github.com/hmziqrs/claude-multi.git
cd claude-multi
bun install
```

## Project structure

```
src/
├── cli.ts              # Commander.js CLI entry point + interactive mode
├── config.ts           # Core config management (instances, plugins, MCP, symlinks)
├── templates.ts        # Provider templates (env vars, model mappings)
├── constants.ts        # Shared string constants
├── errors.ts           # Standardized error system (ClaudeMultiError + ErrorCode)
├── health.ts           # Health check system
├── migration.ts        # Config version migration with backups and locking
├── wrapper.ts          # Wrapper script generation (shell/batch)
├── version.ts          # Version checking and update logic
├── paths.ts            # Base directory resolution
├── util/
│   ├── json-file.ts    # Atomic JSON file writes
│   └── runtime.ts      # Package manager detection
├── ink/                # Ink-based Terminal UI
│   ├── App.tsx         # Root app: menu, screen routing, keyboard input
│   ├── main.tsx        # Ink render entry point
│   ├── components/     # Reusable UI components
│   ├── screens/        # TUI screens (AddInstance, ListInstances, etc.)
│   └── hooks/          # Custom hooks (useConfig, useHealthCheck, etc.)
└── web/                # Astro docs site (this site)
    ├── content/        # Starlight docs + blog + FAQ
    └── pages/          # Marketing page, static pages
```

## Build

```bash
# Build the CLI
bun run build

# Build the Ink TUI (separate bundle)
bun run build:ink

# Build the docs site
bun run docs:build
```

## Test

```bash
# Run all tests
bun test

# Run a specific test file
bun test test/config.test.ts

# Run tests matching a pattern
bun test --grep "symlink"
```

The test suite has 155+ tests across 16 files covering config management, plugin operations, health checks, migration, wrapper generation, Ink components, CLI commands, and end-to-end flows.

Tests use `CLAUDE_MULTI_HOME` to isolate from your real config — they create temporary directories and clean up after themselves.

## Lint and typecheck

```bash
# TypeScript check
bun run typecheck

# Lint
bun run lint
```

## Run locally

```bash
# Run the CLI directly from source
bun src/cli.ts

# Run with the Ink TUI
bun src/ink/main.tsx

# Run the docs dev server
bun run docs:dev
```

## Architecture notes

**Wrapper-based isolation:** Each instance gets a shell script that sets `CLAUDE_CONFIG_DIR` and `exec`s the real `claude` binary. No forking, no patching.

**Atomic writes:** Config files are written using a temp-file-rename pattern with JSON verification. See `src/util/json-file.ts`.

**Security:** Settings copy from `~/.claude` uses a whitelist — only safe fields are transferred. The `env` block (containing API keys) is never copied.

**Error handling:** All thrown errors use `ClaudeMultiError` with a machine-readable `ErrorCode`. Catch blocks use `unknown` typing — no `(err as Error)` casts.

**String constants:** Bare string literals used in comparisons are replaced with typed constants in `src/constants.ts`.

## CI/CD

The project uses GitHub Actions for:

- **ci.yml** — Cross-platform build + test on push to master and PRs
- **publish.yml** — npm publish with OIDC trusted publishing
- **deploy-docs.yml** — Docs site deployment to Cloudflare Pages
- **test-install.yml** — Cross-platform install verification (bun/node/deno × Linux/Windows/macOS)

## Adding a provider template

1. Open `src/templates.ts`
2. Add a new entry to the `providerTemplates` object following the existing pattern
3. Set `name`, `displayName`, `description`, and the `settings.env` block
4. Run tests: `bun test`
5. Update the provider table in `src/web/content/docs/docs/providers.md`

## Submitting changes

1. Fork the repo
2. Create a feature branch from `master`
3. Make your changes
4. Run `bun test` and `bun run typecheck`
5. Open a PR against `master`

## License

MIT. See [LICENSE](https://github.com/hmziqrs/claude-multi/blob/master/LICENSE).
