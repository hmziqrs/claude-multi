import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { isThirdPartyApiBroken, installPinnedClaude, getPinnedBinaryVersion, COMPATIBLE_CLAUDE_VERSION } from "@/version";
import { PINNED_CLAUDE_BIN } from "@/paths";
import { Select, Spinner } from "@inkjs/ui";
import { Header } from "@/ink/components/Header";
import { Footer } from "@/ink/components/Footer";
import { StatusBar } from "@/ink/components/StatusBar";
import { WarningBanner } from "@/ink/components/WarningBanner";
import { useConfig } from "@/ink/hooks/useConfig";
import { useHealthCheck } from "@/ink/hooks/useHealthCheck";
import { useFadeIn, useTypewriter } from "@/ink/hooks/useAnimations";
import { useNavigation } from "@/ink/hooks/useNavigation";
import { fixWrapperVersions } from "@/health";
import { AddInstance } from "@/ink/screens/AddInstance";
import { ListInstances } from "@/ink/screens/ListInstances";
import { ShowInstanceInfo } from "@/ink/screens/ShowInstanceInfo";
import { RemoveInstance } from "@/ink/screens/RemoveInstance";
import { ToggleAutoSync } from "@/ink/screens/ToggleAutoSync";
import { ManagePlugins } from "@/ink/screens/ManagePlugins";
import { FixSymlinks } from "@/ink/screens/FixSymlinks";
import { ManageMcp } from "@/ink/screens/ManageMcp";
import { HealthScreen } from "@/ink/screens/HealthScreen";
import { UpdateScreen } from "@/ink/screens/UpdateScreen";

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
  | "update"
  | "doctor-result"
  | "goodbye";

const GoodbyeScreen: React.FC = () => {
  const msg = useTypewriter("👋 Goodbye!", 40);
  return (
    <Box paddingX={2} paddingY={1}>
      <Text dimColor>{msg}</Text>
    </Box>
  );
};

// [SAFE PARK] Doctor result screen for pinned binary fix flow
const DoctorResultScreen: React.FC<{ fixedCount: number; installFailed: boolean; onBack: () => void }> = ({ fixedCount, installFailed, onBack }) => {
  useNavigation(onBack);
  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🔧 Doctor Fix" />
      {installFailed ? (
        <>
          <StatusBar message="Failed to install pinned Claude binary" type="error" />
          <Box marginTop={1}>
            <Text dimColor>Check your network connection and try again.</Text>
          </Box>
        </>
      ) : fixedCount > 0 ? (
        <>
          <StatusBar message={`Fixed ${fixedCount} wrapper(s) to use pinned Claude v${COMPATIBLE_CLAUDE_VERSION}!`} type="success" />
          <Box marginTop={1}>
            <Text dimColor>All 3rd-party API instances now use the correct Claude binary.</Text>
          </Box>
        </>
      ) : (
        <StatusBar message="All wrappers already use the correct Claude version" type="info" />
      )}
      <Box marginTop={1}>
        <Text dimColor>ESC to go back</Text>
      </Box>
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
  const { instances, loading, migrationStatus, instanceMigrationVersion } = useConfig();
  const { issues, dismiss, dismissAll, retry } = useHealthCheck(instances, migrationStatus, instanceMigrationVersion);
  const [screen, setScreen] = useState<Screen>("menu");
  const [menuKey, setMenuKey] = useState(0);
  const [ccVersion, setCcVersion] = useState<string | null>(null);
  const [doctorFixedCount, setDoctorFixedCount] = useState(0);
  const [doctorInstallFailed, setDoctorInstallFailed] = useState(false);

  useEffect(() => {
    try {
      const output = execSync("claude --version 2>/dev/null", { encoding: "utf-8", timeout: 5000 }).trim();
      setCcVersion(output.split(" ")[0] || null);
    } catch { /* not found */ }
  }, []);

  useInput((input, key) => {
    if (screen !== "menu") return;
    if (input === "q" || key.escape) {
      setScreen("goodbye");
      setTimeout(() => exit(), 300);
    } else if (input === "!" && issues.length > 0) {
      goToHealth();
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
        onFix={() => {
          // [SAFE PARK] Ensure pinned binary is installed before fixing
          let installFailed = false;
          if (!existsSync(PINNED_CLAUDE_BIN)) {
            try { installPinnedClaude(); } catch { installFailed = true; }
          } else {
            const pinnedVer = getPinnedBinaryVersion();
            if (pinnedVer && isThirdPartyApiBroken(pinnedVer)) {
              try { installPinnedClaude(); } catch { installFailed = true; }
            }
          }
          const fixed = installFailed ? [] : fixWrapperVersions(instances);
          setDoctorFixedCount(fixed.length);
          setDoctorInstallFailed(installFailed);
          if (fixed.length > 0) {
            retry();
          }
          setScreen("doctor-result");
        }}
        onBack={goToMenu}
      />
    );
  }

  if (screen === "doctor-result") {
    return <DoctorResultScreen fixedCount={doctorFixedCount} installFailed={doctorInstallFailed} onBack={goToMenu} />;
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
  const versionIssues = issues.filter(i => i.category === "version"); // [SAFE PARK]
  const hasVersionIssues = versionIssues.length > 0;

  const goToHealth = () => {
    setScreen("health");
  };

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
    { label: "🩺 Doctor check", value: "doctor-check" },
    // [SAFE PARK] Show fix wrappers option when version issues detected
    ...(hasVersionIssues
      ? [{ label: "🔧 Fix wrappers (3rd-party API)", value: "doctor-fix" }]
      : []),
    { label: "📦 Check for updates", value: "update" },
    { label: "🚪 Exit", value: "exit" },
  ];

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🤖 Claude Multi" subtitle="Interactive Mode" />

      <WarningBanner
        issueCount={issues.length}
        errorCount={errorCount}
        warningCount={warningCount}
        hasVersionIssues={hasVersionIssues}
      />

      {/* [SAFE PARK] Version warning banner for broken 3rd-party API compat */}
      {ccVersion && isThirdPartyApiBroken(ccVersion) && (
        <Box marginBottom={1}>
          <Text color="red" bold>⚠ Claude Code v{ccVersion} does not work with 3rd party APIs. </Text>
          <Text color="red">Run 'claude-multi doctor fix' to install a compatible version.</Text>
        </Box>
      )}

      <InstanceLine instances={instances} />

      <Select
        key={menuKey}
        options={menuOptions}
        visibleOptionCount={menuOptions.length}
        onChange={(value) => {
          if (value === "exit") {
            setScreen("goodbye");
            setTimeout(() => exit(), 300);
          } else if (value === "doctor-check") {
            setScreen("health");
          } else if (value === "doctor-fix") {
            // [SAFE PARK] Ensure pinned binary is installed before fixing
            let installFailed = false;
            if (!existsSync(PINNED_CLAUDE_BIN)) {
              try { installPinnedClaude(); } catch { installFailed = true; }
            } else {
              const pinnedVer = getPinnedBinaryVersion();
              if (pinnedVer && isThirdPartyApiBroken(pinnedVer)) {
                try { installPinnedClaude(); } catch { installFailed = true; }
              }
            }
            const fixed = installFailed ? [] : fixWrapperVersions(instances);
            setDoctorFixedCount(fixed.length);
            setDoctorInstallFailed(installFailed);
            if (fixed.length > 0) {
              retry();
            }
            setScreen("doctor-result");
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
  update: UpdateScreen,
};
