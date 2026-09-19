/**
 * User-customizable tunables: PRESERVED during template sync, EXCLUDED from staleness
 * detection. Add new tunable env vars from provider templates here too.
 */
export const TUNABLE_ENV_VARS: ReadonlySet<string> = new Set([
  "MAX_OUTPUT_TOKENS",
  "MAX_THINKING_TOKENS",
  "REASONING_EFFORT",
  "ENABLE_THINKING",
  "ENABLE_STREAMING",
  "API_TIMEOUT_MS",
  "CLAUDE_CODE_EFFORT_LEVEL",
  // Auto-compaction tuning — needed for third-party models whose real context size Claude Code doesn't know.
  "CLAUDE_CODE_AUTO_COMPACT_WINDOW",
  "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE",
]);
