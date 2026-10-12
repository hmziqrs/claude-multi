# Contributing

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
├── cli.ts
├── config.ts
├── templates.ts
├── constants.ts
├── errors.ts
├── health.ts
├── migration.ts
├── wrapper.ts
├── version.ts
├── paths.ts
├── util/
│   ├── json-file.ts
│   └── runtime.ts
└── ink/
    ├── App.tsx
    ├── main.tsx
    ├── components/
    ├── screens/
    └── hooks/

web/
├── content/
└── pages/
```

## Build

```bash
bun run build

bun run docs:build
```

## Test

```bash
bun run test

bun test test/config.test.ts

bun test --grep "symlink"
```

The test suite has 244 tests across 16 files covering config management, plugin operations, health checks, migration, wrapper generation, Ink components, CLI commands, and end-to-end flows.

Tests use `CLAUDE_MULTI_HOME` to isolate from your real config, they create temporary directories and clean up after themselves.

## Lint, format, and typecheck

```bash
bun run typecheck

bun run docs:typecheck

bun run lint
bun run lint:fix

bun run format
bun run format:check
```

## Run locally

```bash
bun src/cli.ts

bun src/ink/main.tsx

bun run docs:dev
```

## Architecture notes

**Wrapper-based isolation:** Each instance gets a shell script that sets `CLAUDE_CONFIG_DIR` and `exec`s the real `claude` binary. No forking, no patching.

**Atomic writes:** Config files are written using a temp-file-rename pattern with JSON verification. See `src/util/json-file.ts`.

**Security:** Settings copy from `~/.claude` uses a whitelist, only safe fields are transferred. The `env` block (containing API keys) is never copied.

**Error handling:** All thrown errors use `ClaudeMultiError` with a machine-readable `ErrorCode`. Catch blocks use `unknown` typing, no `(err as Error)` casts.

**String constants:** Bare string literals used in comparisons are replaced with typed constants in `src/constants.ts`.

## CI/CD

The project uses GitHub Actions for:

- **ci.yml**, Cross-platform build + test on push to master and PRs
- **publish.yml**, npm publish with OIDC trusted publishing
- **deploy-docs.yml**, Docs site deployment to Cloudflare Pages
- **test-install.yml**, Cross-platform install verification (bun/node/deno × Linux/Windows/macOS)

## Adding a provider template

1. Open `src/templates.ts`
2. Add a new entry to the `providerTemplates` object following the existing pattern
3. Set `name`, `displayName`, `description`, and the `settings.env` block
4. Run tests: `bun test`
5. Update the provider table in `web/pages/providers/index.astro` and add a matching entry to `web/content/providers/`

## Submitting changes

1. Fork the repo
2. Create a feature branch from `master`
3. Make your changes
4. Run `bun test` and `bun run typecheck`
5. Open a PR against `master`

## License

MIT. See [LICENSE](https://github.com/hmziqrs/claude-multi/blob/master/LICENSE).
