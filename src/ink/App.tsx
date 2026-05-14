import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Select, Spinner } from "@inkjs/ui";
import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import { WarningBanner } from "./components/WarningBanner.js";
import { useConfig } from "./hooks/useConfig.js";
import { useHealthCheck } from "./hooks/useHealthCheck.js";
import { useFadeIn, useTypewriter } from "./hooks/useAnimations.js";
import { AddInstance } from "./screens/AddInstance.js";
import { ListInstances } from "./screens/ListInstances.js";
import { ShowInstanceInfo } from "./screens/ShowInstanceInfo.js";
import { RemoveInstance } from "./screens/RemoveInstance.js";
import { ToggleAutoSync } from "./screens/ToggleAutoSync.js";
import { ManagePlugins } from "./screens/ManagePlugins.js";
import { FixSymlinks } from "./screens/FixSymlinks.js";
import { ManageMcp } from "./screens/ManageMcp.js";
import { HealthScreen } from "./screens/HealthScreen.js";

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
  | "health"
  | "goodbye";

const GoodbyeScreen: React.FC = () => {
  const msg = useTypewriter("👋 Goodbye!", 40);
  return (
    <Box paddingX={2} paddingY={1}>
      <Text dimColor>{msg}</Text>
    </Box>
  );
};

const InstanceLine: React.FC<{ instances: { name: string }[] }> = ({ instances }) => {
  const visible = useFadeIn(100);
  if (!visible || instances.length === 0) return null;
  return (
    <Box marginBottom={1}>
      <Text dimColor>
        {instances.length} instance(s):{" "}
        {instances.map((i) => i.name).join(", ")}
      </Text>
    </Box>
  );
};

export const App: React.FC = () => {
  const { exit } = useApp();
  const { instances, loading, migrationStatus } = useConfig();
  const { issues, dismiss, dismissAll, retry } = useHealthCheck(instances, migrationStatus);
  const [screen, setScreen] = useState<Screen>("menu");
  const [menuKey, setMenuKey] = useState(0);

  useInput((input, key) => {
    if (screen !== "menu") return;
    if (input === "q" || key.escape) {
      setScreen("goodbye");
      setTimeout(() => exit(), 300);
    } else if (input === "!" && issues.length > 0) {
      setScreen("health");
    }
  });

  if (loading) {
    return (
      <Box paddingX={2} paddingY={1}>
        <Spinner label="Loading..." />
      </Box>
    );
  }

  const goToMenu = () => {
    setScreen("menu");
    setMenuKey((k) => k + 1);
  };

  if (screen === "goodbye") {
    return <GoodbyeScreen />;
  }

  if (screen === "health") {
    return (
      <HealthScreen
        issues={issues}
        onDismiss={dismiss}
        onDismissAll={dismissAll}
        onRetry={retry}
        onBack={goToMenu}
      />
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

  const errorCount = issues.filter(i => i.severity === "error").length;
  const warningCount = issues.filter(i => i.severity === "warning").length;

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
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🤖 Claude Multi" subtitle="Interactive Mode" />

      <WarningBanner
        issueCount={issues.length}
        errorCount={errorCount}
        warningCount={warningCount}
      />

      <InstanceLine instances={instances} />

      <Select
        key={menuKey}
        options={menuOptions}
        visibleOptionCount={menuOptions.length}
        onChange={(value) => {
          if (value === "exit") {
            setScreen("goodbye");
            setTimeout(() => exit(), 300);
          } else {
            setScreen(value as Screen);
          }
        }}
      />

      <Footer showHealthHint={issues.length > 0} />
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
