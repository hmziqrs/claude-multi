export const ErrorCode = {
  // Config / filesystem
  CONFIG_CORRUPTED: "CONFIG_CORRUPTED",
  CONFIG_NOT_FOUND: "CONFIG_NOT_FOUND",
  DEFAULT_DIR_NOT_FOUND: "DEFAULT_DIR_NOT_FOUND",
  DEFAULT_SETTINGS_NOT_FOUND: "DEFAULT_SETTINGS_NOT_FOUND",
  INSTANCE_DIR_NOT_FOUND: "INSTANCE_DIR_NOT_FOUND",

  // Instance lifecycle
  INSTANCE_NOT_FOUND: "INSTANCE_NOT_FOUND",
  INSTANCE_ALREADY_EXISTS: "INSTANCE_ALREADY_EXISTS",
  INSTANCE_RUNNING: "INSTANCE_RUNNING",

  // Plugin operations
  PLUGIN_NOT_FOUND: "PLUGIN_NOT_FOUND",
  PLUGIN_INSTALL_FAILED: "PLUGIN_INSTALL_FAILED",
  PLUGIN_REMOVE_FAILED: "PLUGIN_REMOVE_FAILED",
  PLUGIN_TOO_LARGE: "PLUGIN_TOO_LARGE",
  NO_PLUGINS_SELECTED: "NO_PLUGINS_SELECTED",

  // Symlink / auto-sync
  SYMLINK_CONFLICT: "SYMLINK_CONFLICT",
  MCP_NOT_FOUND: "MCP_NOT_FOUND",

  // System / Claude binary
  CLAUDE_NOT_FOUND: "CLAUDE_NOT_FOUND",

  // Update
  UPDATE_FAILED: "UPDATE_FAILED",
  VERSION_CHECK_FAILED: "VERSION_CHECK_FAILED",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class ClaudeMultiError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ClaudeMultiError";
    this.code = code;
  }
}

/** Extracts a human-readable message from any caught value. */
export function toMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
