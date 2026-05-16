# Hardening & Refinement Plan

## Context

The codebase is functionally solid but has accumulated several correctness and robustness gaps:

- String literals scattered across screens and CLI are compared bare (`action === "install"`, `step === "done"`) with no compile-time safety
- `config.ts` has five silent `catch {}` blocks that discard failures invisibly
- `handleAddInstance` has no rollback — a failure mid-way leaves a zombie entry in the config
- JSON is parsed and immediately cast to typed interfaces throughout (`config.ts`, `health.ts`, `version.ts`) with no runtime shape validation
- Catch blocks uniformly use `(err as Error).message` instead of narrowing `unknown`
- `ClaudeSettings` uses `[key: string]: any` which defeats the type system for that interface
- Exit code behavior is inconsistent — user cancel and real errors both exit 1 in most paths

---

## Phase 1 — Shared string constants (`src/constants.ts`)

**Goal:** Replace all bare string literals used in comparisons with typed constants. No behavior change.

### 1a. Create `src/constants.ts`

Single file exporting const objects (not TypeScript `enum` keyword — const objects are tree-shakeable, play well with `satisfies`, and produce no runtime overhead).

```ts
export const MigrationStatus = {
  Completed: "completed",
  Failed: "failed",
  Pending: "pending",
} as const;
export type MigrationStatus = typeof MigrationStatus[keyof typeof MigrationStatus];

export const PluginCategory = {
  Internal: "internal",
  External: "external",
} as const;
export type PluginCategory = typeof PluginCategory[keyof typeof PluginCategory];

export const McpServerType = {
  Stdio: "stdio",
  Http: "http",
  Sse: "sse",
} as const;
export type McpServerType = typeof McpServerType[keyof typeof McpServerType];

export const CopyOption = {
  None: "none",
  Settings: "settings",
  SettingsAndMcp: "settings+mcp",
  SelectPlugins: "select-plugins",
  All: "all",
  Mcp: "mcp",
} as const;
export type CopyOption = typeof CopyOption[keyof typeof CopyOption];

export const PluginAction = {
  List: "list",
  Enable: "enable",
  Disable: "disable",
  Install: "install",
  Remove: "remove",
  Copy: "copy",
  ListDefaults: "list-defaults",
  ListInstalled: "list-installed",
  CheckCollisions: "check-collisions",
} as const;
export type PluginAction = typeof PluginAction[keyof typeof PluginAction];

export const McpAction = {
  List: "list",
  Copy: "copy",
  Verify: "verify",
} as const;
export type McpAction = typeof McpAction[keyof typeof McpAction];
```

### 1b. Update `McpServer`, `PluginInfo`, `MigrationMeta` in `config.ts`

```ts
// Before:
type: "http" | "sse" | "stdio";
category: "internal" | "external";
migrationStatus: "completed" | "failed" | "pending";

// After:
type: McpServerType;
category: PluginCategory;
migrationStatus: MigrationStatus;
```

### 1c. Replace comparisons in `config.ts`, `migration.ts`, `health.ts`, `cli.ts`

All `=== "internal"`, `=== "completed"`, `=== "stdio"` etc. → `=== PluginCategory.Internal`, etc.

Particularly in `cli.ts`:
- `validatePluginOperation` (line ~1167) `operation === "install"` → `=== PluginAction.Install`
- `handleAutoSync` status parsing: normalize once with `toLowerCase()`, then compare against a set of known values
- `copyOption` comparisons at lines ~223 and ~1175

### 1d. Update Ink screens step/action types

Each screen's local `type Step = "..."` stays as-is (these are component-local, exhaustive unions — the type system already enforces them). What changes is the **action select option values** that flow from `Select onChange` into `handleAction`:

- `ManagePlugins` action values → `PluginAction.*`
- `ManageMcp` action values → `McpAction.*`
- `ToggleAutoSync` action values (`"force-sync"`, `"cancel"`, `"toggle"`) → local const in that file
- `AddInstance` copy option values → `CopyOption.*`

**Verify:** `bun test` — no behavior change.

---

## Phase 2 — Tighten `ClaudeSettings` and unvalidated JSON casts

**Goal:** Remove `[key: string]: any` from `ClaudeSettings` and replace raw `JSON.parse(...) as T` casts with narrow type guards.

### 2a. Fix `ClaudeSettings`

```ts
// Before:
export interface ClaudeSettings {
  enabledPlugins?: Record<string, boolean>;
  mcpServers?: Record<string, McpServer>;
  [key: string]: any;  // ← defeats the type checker
}

// After:
export interface ClaudeSettings {
  enabledPlugins?: Record<string, boolean>;
  mcpServers?: Record<string, McpServer>;
}
```

The index signature was there to allow pass-through writes of unknown keys during settings merge (`writeClaudeSettings`). Fix the merge logic to use `Object.assign` on `unknown` then cast once at the write boundary, rather than carrying `any` in the interface.

### 2b. Type guard for `Config`

Replace `JSON.parse(content) as Config` in `config.ts:169` with a narrow guard:

```ts
function isConfig(raw: unknown): raw is Config {
  return (
    typeof raw === "object" && raw !== null &&
    Array.isArray((raw as Config).instances) &&
    typeof (raw as Config).version === "string"
  );
}
```

Apply similarly to `MigrationMeta` (read in `migration.ts:25`) and the lock-file shape (`{ pid, startedAt }`).

### 2c. Guard `version.ts` package.json read

```ts
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as unknown;
if (typeof pkg !== "object" || pkg === null || typeof (pkg as { version?: unknown }).version !== "string") {
  throw new Error("Could not read package version");
}
return (pkg as { version: string }).version;
```

### 2d. Guard `ManageMcp` user JSON input

`handleAddConfigSubmit` parses raw user text. Add a shape check after `JSON.parse`:

```ts
const raw = JSON.parse(value) as unknown;
if (typeof raw !== "object" || raw === null || !("type" in raw)) {
  throw new Error("Config must be a JSON object with a 'type' field");
}
```

**No new deps.** All guards are plain type predicates — no Zod needed.

**Verify:** `bun test`; manually test settings round-trip with unknown keys.

---

## Phase 3 — Typed catch blocks and remove silent swallows

**Goal:** Every `catch` block either handles or surfaces the error. No bare `catch {}`.

### 3a. Catch parameter typing

TypeScript 4+ allows `catch (err: unknown)`. Change all catch sites:

```ts
// Before:
} catch (err) {
  setError((err as Error).message);
}

// After:
} catch (err: unknown) {
  setError(err instanceof Error ? err.message : String(err));
}
```

Apply to all catch blocks in `config.ts`, `migration.ts`, `health.ts`, `cli.ts`, and all Ink screens.

### 3b. Silent `catch {}` in `config.ts`

Five locations swallow errors completely:

| Line | Context | Fix |
|------|---------|-----|
| 965 | Plugin dir stat | Log warning with `chalk.yellow` |
| 1003 | Plugin file read | Log warning |
| 1122 | File size calculation | Return 0 / partial total (already handles this — just remove the `catch {}`) |
| 1305 | Backup rename on failure | Log warning: "could not clean up backup" |
| 1340 | Rollback rename | Log error: rollback attempt failed |

`src/migration.ts:46` (`rmSync` lock file cleanup) — safe to stay silent, but add a comment explaining why.

`src/ink/screens/ManageMcp.tsx:189` — the `catch {}` in `buildMcpSources` during plugin-name resolution. This failure means plugin names show as "unknown", which is acceptable. Add a comment.

### 3c. Remove `any` providerTemplate

```ts
// Before:
let providerTemplate: any = null;

// After:
let providerTemplate: ProviderTemplate | null = null;
```

**Verify:** `bun test`.

---

## Phase 4 — Rollback on failed `add`

**Goal:** If `handleAddInstance` fails after writing the config entry, clean up so the user isn't left with a zombie instance.

### 4a. Wrap the multi-step create sequence

```ts
await addInstance(instance);
try {
  await createWrapper(instance);
  if (copySettings && !copyAllFiles) await copySettingsFromDefault(configDir);
  // ... rest of copy steps
} catch (err: unknown) {
  // Roll back: remove registry entry and any partial wrapper
  await removeInstance(name).catch(() => {});
  removeWrapper(binaryPath);
  throw err; // re-throw so the caller sees it
}
```

The rollback itself wraps in `.catch(() => {})` because we're already in an error path — best effort.

### 4b. Same pattern in `AddInstance.tsx` TUI

The `handleCreate` function in the Ink screen calls the same underlying `addInstance` + `createWrapper` sequence. Wrap in try/catch and — crucially — allow the user to go back to the `"name"` step to retry rather than leaving the screen dead on error.

Currently `step === "creating"` is a terminal state on error. Change: on catch, set `step` back to `"name"` so the user sees the error via `StatusBar` and can retry.

**Verify:** Manually trigger a failure (e.g., pass a non-existent `--config` parent dir) and confirm no zombie entry in `claude-multi list`.

---

## Phase 5 — Exit code consistency

**Goal:** Scripts can reliably distinguish "user cancelled" (exit 0) from "command failed" (exit 1).

### Current state

- `process.exit(0)` only at lines 219 and 1813 (interactive menu cancel and update check)
- All other cancel/back paths fall through without an explicit exit or with `exit(1)`
- A CI script doing `claude-multi add foo --provider none && do_next_step` gets exit 1 on an interactive cancel

### Fix

Add a small helper:

```ts
function exitWithCode(code: 0 | 1): never {
  process.exit(code);
}
```

Then audit each path:
- User explicitly cancelled / pressed ESC → `exitWithCode(0)`
- Validation failure / instance not found / network error → `exitWithCode(1)`
- `requireInstance` already exits 1 — leave as-is

The change is mechanical: grep for `return;` after user-cancel branches and replace with `exitWithCode(0)`.

**Verify:** `bun test`; manually test cancel paths and check `echo $?`.

---

## Phase 6 — `handleAddInstance` test coverage

**Goal:** The most complex path in the codebase has zero direct tests. Add a targeted suite.

### Cases to cover

1. Happy path — non-interactive flags (`--provider none --name foo`) creates instance, binary wrapper exists
2. Duplicate name → error, no new entry
3. `--copy-all` → settings file copied
4. Failed `createWrapper` → no zombie entry in config (regression guard for Phase 4)
5. Invalid name pattern (`foo bar`) → rejected before touching the filesystem

These should use the same `CLAUDE_MULTI_HOME` test-isolation pattern already in `test/config.test.ts`.

**Verify:** `bun test test/add-instance.test.ts` (new file).

---

## Critical files to modify

| File | Phases |
|------|--------|
| `src/constants.ts` | 1 (new) |
| `src/config.ts` | 1, 2, 3 |
| `src/cli.ts` | 1, 3, 4, 5 |
| `src/migration.ts` | 1, 3 |
| `src/health.ts` | 1, 3 |
| `src/version.ts` | 2 |
| `src/ink/screens/AddInstance.tsx` | 1, 4 |
| `src/ink/screens/ManageMcp.tsx` | 1, 3 |
| `src/ink/screens/ManagePlugins.tsx` | 1 |
| `src/ink/screens/ToggleAutoSync.tsx` | 1 |
| `test/add-instance.test.ts` | 6 (new) |

## Out of scope (deliberate)

- Zod / runtime schema validation library — the type guards in Phase 2 cover the critical parse points without adding a dependency
- Full TypeScript strict null check audit — `noUncheckedIndexedAccess` is already on; remaining issues are minor
- Rewriting `handleAddInstance` into smaller functions — Phase 6 tests make it safe to do later; don't refactor untested code
- UI polish / new features — separate concern
