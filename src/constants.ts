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
