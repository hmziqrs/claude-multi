import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Select, Spinner } from "@inkjs/ui";
import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import { useConfig } from "./hooks/useConfig.js";
import { AddInstance } from "./screens/AddInstance.js";
import { ListInstances } from "./screens/ListInstances.js";
import { ShowInstanceInfo } from "./screens/ShowInstanceInfo.js";
import { RemoveInstance } from "./screens/RemoveInstance.js";
import { ToggleAutoSync } from "./screens/ToggleAutoSync.js";
import { ManagePlugins } from "./screens/ManagePlugins.js";
import { FixSymlinks } from "./screens/FixSymlinks.js";
import { ManageMcp } from "./screens/ManageMcp.js";

type Screen =
  | "menu"
  | "add"
  | "list"
  | "info"
  | "remove"
  | "autosync"
  | "resync"
  | "plugins"
  | "mcp"
  | "goodbye";

export const App: React.FC = () => {
  const { exit } = useApp();
  const { instances, loading } = useConfig();
  const [screen, setScreen] = useState<Screen>("menu");
  const [menuKey, setMenuKey] = useState(0);

  // Only handle q on menu — sub-screens handle their own nav
  useInput((input, key) => {
    if (screen !== "menu") return;
    if (input === "q" || key.escape) {
      setScreen("goodbye");
      setTimeout(() => exit(), 300);
    }
  });

  if (loading) {
    return (
      <Box padding={1}>
        <Spinner label="Loading..." />
      </Box>
    );
  }

  const goToMenu = () => {
    setScreen("menu");
    setMenuKey((k) => k + 1);
  };

  if (screen === "goodbye") {
    return (
      <Box padding={1}>
        <Text dimColor>👋 Goodbye!</Text>
      </Box>
    );
  }

  if (screen !== "menu") {
    const ScreenComponent = SCREEN_MAP[screen];
    if (ScreenComponent) {
      return <ScreenComponent onBack={goToMenu} />;
    }
    goToMenu();
    return null;
  }

  // ── Main Menu ──
  const menuOptions = [
    { label: "➕ Add new instance", value: "add" },
    { label: "📋 List all instances", value: "list" },
    ...(instances.length > 0
      ? [
          { label: "ℹ️  Instance details", value: "info" },
          { label: "🔌 Manage plugins", value: "plugins" },
          { label: "🔄 Toggle auto-sync", value: "autosync" },
          { label: "🔗 Re-sync symlinks", value: "resync" },
          { label: "🗑️  Remove instance", value: "remove" },
          { label: "⚙️  MCP servers", value: "mcp" },
        ]
      : []),
    { label: "🚪 Exit", value: "exit" },
  ];

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="🤖 Claude Multi" subtitle="Interactive Mode" />

      {instances.length > 0 && (
        <Box marginBottom={1}>
          <Text dimColor>
            {instances.length} instance(s):{" "}
            {instances.map((i) => i.name).join(", ")}
          </Text>
        </Box>
      )}

      <Select
        key={menuKey}
        options={menuOptions}
        onChange={(value) => {
          if (value === "exit") {
            setScreen("goodbye");
            setTimeout(() => exit(), 300);
          } else {
            setScreen(value as Screen);
          }
        }}
      />

      <Footer />
    </Box>
  );
};

const SCREEN_MAP: Record<string, React.FC<{ onBack: () => void }>> = {
  add: AddInstance,
  list: ListInstances,
  info: ShowInstanceInfo,
  remove: RemoveInstance,
  autosync: ToggleAutoSync,
  resync: FixSymlinks,
  plugins: ManagePlugins,
  mcp: ManageMcp,
};
