/**
 * Env vars that the user may have intentionally customized in settings.json.
 *
 * During template sync these are PRESERVED (user values take priority).
 * During mismatch detection these are EXCLUDED (they don't indicate staleness).
 *
 * If you add a new tunable env var to a provider template, add it here too
 * so it's excluded from staleness checks and preserved during sync.
 */
export const TUNABLE_ENV_VARS: ReadonlySet<string> = new Set([
  "MAX_OUTPUT_TOKENS",
  "MAX_THINKING_TOKENS",
  "REASONING_EFFORT",
  "ENABLE_THINKING",
  "ENABLE_STREAMING",
  "API_TIMEOUT_MS",
  "CLAUDE_CODE_EFFORT_LEVEL",
]);
