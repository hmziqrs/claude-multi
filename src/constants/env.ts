/**
 * User-customizable tunables: PRESERVED during template sync, EXCLUDED from staleness detection.
 */
export const TUNABLE_ENV_VARS: ReadonlySet<string> = new Set([
  "CLAUDE_CODE_MAX_OUTPUT_TOKENS",
  "CLAUDE_CODE_MAX_CONTEXT_TOKENS",
  "MAX_THINKING_TOKENS",
  "API_TIMEOUT_MS",
  "CLAUDE_CODE_EFFORT_LEVEL",
  "CLAUDE_CODE_AUTO_COMPACT_WINDOW",
  "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE",
]);
