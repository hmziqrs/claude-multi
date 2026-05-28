# Quality-of-Life Audit — claude-multi

Audited 2026-05-28. Covers CLI, Ink TUI, config management, wrapper scripts, templates, and docs.

---

## P0 — Critical Pain Points

### 1. No way to update API keys or env vars after creation

If an API key expires or rotates, the user must manually edit `~/.claude-<name>/settings.json`. There is no CLI command (`env update`, `env rotate-key`) and no TUI screen for this. `mergeProviderEnv` exists in `config.ts` but is only called during initial creation.

**Affected files:** `src/cli.ts`, `src/config.ts`, `src/ink/screens/`

### 2. No MCP API key rotation

MCP servers store API keys in `env` vars inside `settings.json`. No CLI or TUI operation exists to rotate a key across one or all instances. Users must find and edit JSON manually for each instance.

**Affected files:** `src/cli.ts` (mcp command), `src/config.ts`

### 3. No `rename` command

Changing an instance name requires remove + recreate, losing plugins, MCP config, and conversation history. No `renameInstance` function exists in `config.ts`.

**Affected files:** `src/cli.ts`, `src/config.ts`

---

## P1 — Significant Friction

### 4. No `clone` command

Creating a similar instance requires going through the entire wizard again. A `clone <source> <new-name>` command would copy settings, env vars, and MCP config to a new instance.

**Affected files:** `src/cli.ts`, `src/config.ts`

### 5. Non-atomic config writes

`addInstance`, `removeInstance`, and `updateInstanceAutoSync` use `saveConfig` (non-atomic). `saveConfigAtomic` exists but is not used consistently. A crash during write corrupts `config.json`.

**Affected files:** `src/config.ts` lines 225, 237, 264

### 6. Wrapper scripts hardcode Claude path at creation time

`generateWrapperScript` embeds the absolute `claude` path. If Claude is reinstalled via a different package manager or path, all wrappers break. No `sync` or `refresh` command exists to regenerate them.

**Affected files:** `src/wrapper.ts` lines 38-46

### 7. TUI `info` screen missing provider/model/endpoint

`ShowInstanceInfo` shows binary, config, created date, auto-sync, plugins, and MCP — but not which provider, model, or API base URL is configured. The most useful details are missing.

**Affected files:** `src/ink/screens/ShowInstanceInfo.tsx`

### 8. StepIndicator hardcoded to `total={3}`

There are up to 10 steps but the indicator always shows `[X/3]`. Should be dynamic based on `STEP_ORDER`.

**Affected files:** `src/ink/screens/AddInstance.tsx` line 304

### 9. No duplicate-name check in TUI step 1

The CLI checks for duplicates immediately (cli.ts line 1022). The TUI only discovers a duplicate at the end of the wizard when `addInstance` throws. Wastes user time.

**Affected files:** `src/ink/screens/AddInstance.tsx`

### 10. No PATH check in TUI after creation

The CLI shows a warning with fix instructions when `~/.local/bin` is not in PATH. The TUI's `AddResult` component doesn't check. New users hit "command not found" silently.

**Affected files:** `src/ink/screens/AddInstance.tsx` (AddResult component)

### 11. No first-run welcome/orientation

When launched with zero instances, the user sees a blank menu with no guidance. No welcome screen, quick-start guide, or link to docs.

**Affected files:** `src/ink/App.tsx`

### 12. Dead `migrate --retry` command

The health screen tells users to run `claude-multi migrate --retry`, but the command doesn't exist in `cli.ts`. Failed migrations cannot be recovered.

**Affected files:** `src/ink/screens/HealthScreen.tsx`, `src/cli.ts`

---

## P2 — Nice to Have

### 13. No API connectivity test after creation

No function to test whether a provider endpoint is reachable or whether the API key works. Users discover issues only when Claude Code tries to connect.

**Affected files:** `src/templates.ts`

### 14. `remove` doesn't clean config dir

The `remove` command removes the wrapper and config entry but leaves `~/.claude-<name>` on disk. No `--clean` flag or follow-up prompt. Orphaned directories accumulate.

**Affected files:** `src/cli.ts` lines 325-365

### 15. No CLI add/remove for individual MCP servers

CLI `mcp` command only supports `list`, `copy`, `verify`. Adding a server requires manual JSON editing. The Ink TUI has add/remove but CLI doesn't.

**Affected files:** `src/cli.ts` lines 1574-1603

### 16. Single-line JSON input for custom MCP servers

The TUI's `ManageMcp` screen requires typing a full JSON config as a single line. No multi-line editor, no structured form, no validation before submission.

**Affected files:** `src/ink/screens/ManageMcp.tsx` lines 327-334

### 17. `q` exits immediately with no confirm

One accidental keypress from any screen exits the entire app. In the wizard, this loses all progress. Should require a confirm or double-tap.

**Affected files:** `src/ink/hooks/useNavigation.tsx`, `src/ink/App.tsx`

### 18. Missing `Settings+MCP` combined copy option in TUI

The CLI offers "Settings + MCP servers" as a combined option. The Ink TUI's copy options don't include it — users must choose "All" to get both.

**Affected files:** `src/ink/screens/AddInstance.tsx` (copyOptions)

### 19. `paths-confirm` step ignores "No" answer

Both confirm and cancel do the same thing — proceed to copy-options. The confirm is fake.

**Affected files:** `src/ink/screens/AddInstance.tsx` lines 191-193

### 20. Error recovery resets to step 1

When `doCreate` fails, `setStep("name")` throws the user all the way back, losing all form data. Should reset to the failing step.

**Affected files:** `src/ink/screens/AddInstance.tsx` lines 268-273

### 21. Plugin install in TUI has no collision warning

CLI `handlePluginsInstall` detects MCP collisions before installing. TUI `ManagePlugins` installs silently even if servers conflict.

**Affected files:** `src/ink/screens/ManagePlugins.tsx`

### 22. `alwaysThinkingEnabled` field is dead code

Set to `true` on MiniMax template but never read by `applyProviderTemplate` or `mergeProviderEnv`. Dead configuration.

**Affected files:** `src/templates.ts` line 8, `src/config.ts`

### 23. `ENABLE_THINKING` only on GLM template

Other providers that support extended thinking (DeepSeek, Qwen) don't have this set. Users miss out on reasoning capabilities.

**Affected files:** `src/templates.ts`

### 24. Docs have stale timeout values

Docs say `API_TIMEOUT_MS: "600000"` (10 min) but actual templates use `"3000000"` (50 min). Also missing `ENABLE_THINKING`, `REASONING_EFFORT`, `MAX_THINKING_TOKENS`.

**Affected files:** `src/web/content/docs/docs/environment-variables.md`

### 25. Duplicated add-instance logic across 3 implementations

The add flow is implemented independently in: CLI command handler (`cli.ts`), interactive handler (`cli.ts handleAddInstance`), and Ink TUI (`AddInstance.tsx`). Changes must be synchronized across all three, which causes drift and bugs.

**Affected files:** `src/cli.ts`, `src/ink/screens/AddInstance.tsx`

---

## P3 — Polish

### 26. No `lastUsedAt` timestamp on instances

Can't identify stale instances. Only `createdAt` is tracked.

### 27. No search/filter for instances in TUI

With 10+ instances, the Select dropdown becomes unwieldy.

### 28. `info` command doesn't check if binary/config dir exist

Shows paths without verifying they're still valid.

### 29. `list` doesn't flag broken instances

Shows all instances regardless of health, no warning for missing binaries or config dirs.

### 30. Hardcoded Claude Code migration version strings

`initializeInstanceState` sets `lastOnboardingVersion: "2.0.31"` and `migrationVersion: 13`. Will go stale as Claude Code evolves.

**Affected files:** `src/config.ts` lines 692-709

### 31. PATH separator hardcoded to `:`

Only works on Unix. Windows uses `;`.

**Affected files:** `src/cli.ts` line 299

### 32. MCP copy silently overwrites without conflict warning

`copyMcpServersFromDefault` merges with existing servers using spread — target silently wins on name collisions.

**Affected files:** `src/config.ts` lines 576-586

### 33. `useNavigation` calls `onBack()` in both branches

```tsx
if (step === "done") onBack();
else onBack();
```
Both branches do the same thing. The conditional is pointless.

**Affected files:** `src/ink/screens/AddInstance.tsx` lines 136-138

### 34. `useConfig` is a god hook with 40+ methods

Every screen that calls `useConfig()` re-renders when any piece of config changes. No memoization or selective subscription.

**Affected files:** `src/ink/hooks/useConfig.tsx`
