/**
 * Shared SEO constants. DEFAULT_DESC mirrors the homepage hero copy — keep it 150–160 chars
 * (Google truncates beyond that) and update it here only, so the site layouts cannot drift.
 */
export const SITE_URL = 'https://claude-multi.hmziq.xyz';

export const DEFAULT_TITLE = 'claude-multi: a separate Claude Code for every provider';

// Describes what the social card actually depicts, for screen readers and for
// clients that show alt text when the image fails to load. Not the page title.
export const DEFAULT_OG_IMAGE_ALT =
  'claude-multi social card: per-provider claude-glm, claude-deepseek, claude-kimi and claude-qwen commands in a terminal';

export const DEFAULT_DESC =
  'Claude Code gets a separate command and config directory for every provider you use, so switching models never means editing settings.json or swapping keys.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
