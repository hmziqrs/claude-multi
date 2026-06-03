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

export const SyncMode = {
  /** Symlink entire plugins/skills directories — instant sync, blocks individual plugin ops */
  Auto: "auto",
  /** Symlink individual plugins/skills/MCPs — shares existing items, new installs stay isolated */
  HalfManual: "half-manual",
  /** Full copy — completely independent, no symlinks at all */
  FullManual: "full-manual",
} as const;
export type SyncMode = typeof SyncMode[keyof typeof SyncMode];

/** Ordered from most shared to most isolated. Used for downgrade-only enforcement. */
export const SYNC_MODE_ORDER: readonly SyncMode[] = [SyncMode.Auto, SyncMode.HalfManual, SyncMode.FullManual];

/** Returns true if `from` can be converted to `to` (only downgrades allowed). */
export function canConvertSyncMode(from: SyncMode, to: SyncMode): boolean {
  return SYNC_MODE_ORDER.indexOf(to) > SYNC_MODE_ORDER.indexOf(from);
}

/** Returns the SyncModes that `current` can be downgraded to. */
export function availableSyncModeConversions(current: SyncMode): SyncMode[] {
  const idx = SYNC_MODE_ORDER.indexOf(current);
  return SYNC_MODE_ORDER.slice(idx + 1);
}

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
