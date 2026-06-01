# Subagent Model Configuration Plan

## Overview

Currently only the DeepSeek template sets `CLAUDE_CODE_SUBAGENT_MODEL` and `CLAUDE_CODE_EFFORT_LEVEL` in its env block. GLM and MiniMax have no subagent model configuration. This plan adds first-class support for subagent model/effort configuration across all provider templates, with CLI flags, interactive prompts, and Ink UI.

Per [Claude Code docs](https://code.claude.com/docs/en/sub-agents#choose-a-model), `CLAUDE_CODE_SUBAGENT_MODEL` controls which model sub-agents use. Resolution order: env var → per-invocation param → definition frontmatter → main model.

## Design Decisions

- **No duplicate fields.** `CLAUDE_CODE_SUBAGENT_MODEL` and `CLAUDE_CODE_EFFORT_LEVEL` live only in `settings.env`. The `ProviderTemplate` interface does not get matching explicit fields.
- **`availableModels` at root level** of `ProviderTemplate`, not inside `settings`, to avoid accidental serialization into `settings.json`.
- **Override via single `overrides?: Record<string, string>` param** on `applyProviderTemplate()`, which flows through `createSettingsFromTemplate()` and `mergeProviderEnv()`. This keeps signatures compact and avoids field-specific plumbing.
- **`availableModels` on MiniMax and DeepSeek only.** GLM has no alternative subagent model.

## Changes by File

---

### 1. `src/templates.ts`

**Interface — add `availableModels` at root level:**

```typescript
export interface ProviderTemplate {
  name: string;
  displayName: string;
  description: string;
  availableModels?: { label: string; value: string }[];   // NEW
  settings: {
    env: Record<string, string>;
    includeCoAuthoredBy: boolean;
    alwaysThinkingEnabled: boolean;
  };
}
```

**GLM — add env vars (lines 28-29 of env block):**
```typescript
CLAUDE_CODE_SUBAGENT_MODEL: "glm-5-turbo",
CLAUDE_CODE_EFFORT_LEVEL: "high",
```

**MiniMax — add env vars (lines 51-52 of env block):**
```typescript
CLAUDE_CODE_SUBAGENT_MODEL: "MiniMax-M3",
CLAUDE_CODE_EFFORT_LEVEL: "max",
```

**DeepSeek — already has env vars. Add `availableModels` at root (line ~57 area, as sibling of `settings`):**
```typescript
availableModels: [
  { label: "DeepSeek-V4-Flash (fast, recommended)", value: "deepseek-v4-flash" },
  { label: "DeepSeek-V4-Pro (main)", value: "deepseek-v4-pro[1m]" },
],
```

No `availableModels` for GLM (only one candidate: `glm-5-turbo`) and MiniMax (only one candidate: `MiniMax-M3`).

**Function — `applyProviderTemplate()` accept overrides:**
```typescript
export function applyProviderTemplate(
  template: ProviderTemplate,
  apiKey: string,
  overrides?: Record<string, string>,
): Record<string, unknown> {
  const settings = JSON.parse(JSON.stringify(template.settings));
  settings.env.ANTHROPIC_AUTH_TOKEN = apiKey;
  if (overrides) Object.assign(settings.env, overrides);
  return settings;
}
```

---

### 2. `src/config.ts`

**`createSettingsFromTemplate()` (line 653) — add `overrides` param:**
```typescript
export async function createSettingsFromTemplate(
  targetConfigDir: string,
  template: ProviderTemplate,
  apiKey: string,
  overrides?: Record<string, string>,
): Promise<void> {
  if (!existsSync(targetConfigDir)) {
    await mkdir(targetConfigDir, { recursive: true });
  }
  const settings = applyProviderTemplate(template, apiKey, overrides);
  const settingsFile = join(targetConfigDir, "settings.json");
  await writeFile(settingsFile, JSON.stringify(settings, null, 2), "utf-8");
}
```

**`mergeProviderEnv()` (line 705) — add `overrides` param:**
```typescript
export async function mergeProviderEnv(
  configDir: string,
  template: ProviderTemplate,
  apiKey: string,
  overrides?: Record<string, string>,
): Promise<void> {
  // ... existing logic to read existing settings ...
  const templateEnv = JSON.parse(JSON.stringify(template.settings.env));
  templateEnv.ANTHROPIC_AUTH_TOKEN = apiKey;
  if (overrides) Object.assign(templateEnv, overrides);
  existing.env = { ...env, ...templateEnv };
  // ... rest unchanged ...
}
```

---

### 3. `src/cli.ts`

**New flags on `add` command (insert after `--manual` flag, around line 81):**
```typescript
.option("--subagent-model <model>", "Override the sub-agent model (requires --provider)")
.option("--effort-level <level>", "Override reasoning effort level (requires --provider)")
```

**New option destructuring (line 96, add to options type):**
```typescript
subagentModel?: string;
effortLevel?: string;
```

**Flag handling (after `useProviderTemplate = true` block, around line 136):**

At line 122 (inside the `if (options.provider)` block), add validation:
```typescript
if (options.subagentModel) {
  overrides.CLAUDE_CODE_SUBAGENT_MODEL = options.subagentModel;
}
if (options.effortLevel) {
  overrides.CLAUDE_CODE_EFFORT_LEVEL = options.effortLevel;
}
```

Also add a new validation block after the `--api-key` check, around line 131:
```typescript
if ((options.subagentModel || options.effortLevel) && !options.provider) {
  console.error(
    chalk.red("✗ --subagent-model and --effort-level require --provider"),
  );
  process.exit(1);
}
```

**Declare `overrides` variable** alongside `apiKey` (around line 111):
```typescript
let overrides: Record<string, string> = {};
```

**Pass overrides to `mergeProviderEnv()` (line 256):**
```typescript
// Before:
await mergeProviderEnv(configDir, providerTemplate, apiKey);
// After:
await mergeProviderEnv(configDir, providerTemplate, apiKey,
  Object.keys(overrides).length > 0 ? overrides : undefined);
```

**Interactive `handleAddInstance()` — add subagent model prompt:**

After the API key prompt (after `apiKey = inputApiKey;` around line 1152), inside `if (providerTemplate)` block, add:

```typescript
// Ask about subagent model (if provider has multiple options)
let handleAddOverrides: Record<string, string> = {};
const availableModels = providerTemplate.availableModels;
if (availableModels && availableModels.length > 0) {
  const defaultModel = providerTemplate.settings.env.CLAUDE_CODE_SUBAGENT_MODEL;
  const { chosenModel } = await prompts({
    type: "select",
    name: "chosenModel",
    message: "Sub-agent model (used for background tasks, search, code review):",
    choices: availableModels.map((m) => ({
      title: m.value === defaultModel ? `${m.label} (default)` : m.label,
      value: m.value,
    })),
    initial: availableModels.findIndex((m) => m.value === defaultModel),
  });
  if (chosenModel && chosenModel !== defaultModel) {
    handleAddOverrides.CLAUDE_CODE_SUBAGENT_MODEL = chosenModel;
  }
}
```

**Pass overrides at the `createSettingsFromTemplate()` call** (around line 1294):
```typescript
// Before:
await createSettingsFromTemplate(configDir, providerTemplate, apiKey);
// After:
await createSettingsFromTemplate(configDir, providerTemplate, apiKey,
  Object.keys(handleAddOverrides).length > 0 ? handleAddOverrides : undefined);
```

---

### 4. `src/ink/screens/AddInstance.tsx`

**New step `"model-select"` in the type (line 43):**
```typescript
type Step =
  | "name"
  | "provider-select"
  | "provider-apikey"
  | "model-select"        // NEW
  | "paths-confirm"
  | "copy-options"
  | "select-plugins"
  | "autosync"
  | "creating"
  | "done";
```

**`STEP_TITLES` (line 54) — add entry:**
```typescript
"model-select": "Sub-Agent Model",
```

**`STEP_ORDER` (line 66) — insert after `"provider-apikey"`:**
```typescript
const STEP_ORDER: Step[] = [
  "name", "provider-select", "provider-apikey", "model-select",
  "paths-confirm", "copy-options", "select-plugins", "autosync", "creating", "done",
];
```

**Line 252 — fix hardcoded `total={3}` to be dynamic:**
```tsx
<StepIndicator current={stepNumber(step)} total={STEP_ORDER.length - 2} label={STEP_TITLES[step]} />
```
(`- 2` excludes "creating" and "done" which are transient states, not config steps)

**New state variable (after `apiKey` state):**
```typescript
const [subagentModel, setSubagentModel] = useState<string | null>(null);
```

**`goBack` map (line 101) — update:**
```typescript
const prevMap: Partial<Record<Step, Step>> = {
  "provider-select": "name",
  "provider-apikey": "provider-select",
  "model-select": "provider-apikey",       // NEW
  "paths-confirm": "model-select",         // was "provider-select"
  "copy-options": "paths-confirm",
  "select-plugins": "copy-options",
  autosync: "copy-options",
};
```

**`handleApiKeySubmit` (line 140) — route to model-select instead of paths-confirm:**
```typescript
const handleApiKeySubmit = useCallback((value: string) => {
  if (!value.trim()) { setError("API key is required"); return; }
  setError("");
  setApiKey(value);
  setStep("model-select");
}, []);
```

**New handler for model selection:**
```typescript
const handleModelSelect = useCallback((value: string) => {
  setSubagentModel(value);
  setStep("paths-confirm");
}, []);
```

**New UI step (after provider-apikey JSX block, around line 280):**
```tsx
{step === "model-select" && selectedProvider && (() => {
  const template = cfg.getProviderTemplate(selectedProvider);
  const availableModels = template?.availableModels;
  if (!availableModels || availableModels.length === 0) {
    // No model choice needed — skip ahead
    setTimeout(() => setStep("paths-confirm"), 0);
    return null;
  }
  const defaultModel = template!.settings.env.CLAUDE_CODE_SUBAGENT_MODEL;
  const modelOptions = availableModels.map(m => ({
    label: m.value === defaultModel ? `${m.label} (default)` : m.label,
    value: m.value,
  }));
  return (
    <Box flexDirection="column" gap={1}>
      <Text>Sub-agent model:</Text>
      <Text dimColor>Used for background tasks, exploration, and code review</Text>
      <Select
        options={modelOptions}
        visibleOptionCount={modelOptions.length}
        onChange={handleModelSelect}
      />
    </Box>
  );
})()}
```

**In `doCreate()` (line 214-217) — pass subagentModel override:**
```typescript
if (useProvider && selectedProvider) {
  const template = cfg.getProviderTemplate(selectedProvider);
  if (template) {
    const overrides: Record<string, string> = {};
    if (subagentModel) overrides.CLAUDE_CODE_SUBAGENT_MODEL = subagentModel;
    await cfg.mergeProviderEnv(cDir, template, apiKey,
      Object.keys(overrides).length > 0 ? overrides : undefined);
  }
}
```

**In `useConfig.tsx` (line 46) — if `mergeProviderEnv` signatures change, they're already re-exported via `* from config.js`.**

---

## Default Subagent Models

| Provider | Subagent Model        | Effort Level |
|----------|-----------------------|--------------|
| GLM      | `glm-5-turbo`         | `high`       |
| MiniMax  | `MiniMax-M3`          | `max`        |
| DeepSeek | `deepseek-v4-flash`   | `max`        |

---

## Verification

1. `bun run build` (includes TS compilation)
2. `bun test`
3. `claude-multi add test-glm --provider glm --api-key sk-test` — `settings.json` contains `CLAUDE_CODE_SUBAGENT_MODEL: "glm-5-turbo"` and `CLAUDE_CODE_EFFORT_LEVEL: "high"`
4. `claude-multi add test-ds --provider deepseek --api-key sk-test --subagent-model deepseek-v4-pro[1m]` — overrides to Pro model
5. `claude-multi add test --subagent-model foo` — errors with "requires --provider"
6. Ink UI `claude-multi interactive` → add → select DeepSeek → enter API key → model-select step appears
