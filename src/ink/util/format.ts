import type { PluginInfo } from "@/ink/hooks/useConfig";

export function formatPluginLabel(plugin: PluginInfo, opts?: { showCategory?: boolean }): string {
  const mcp = plugin.hasMcp ? " (MCP)" : "";
  const cat = opts?.showCategory && plugin.category === "external" ? " [ext]" : "";
  return `${plugin.name}${mcp}${cat}`;
}
