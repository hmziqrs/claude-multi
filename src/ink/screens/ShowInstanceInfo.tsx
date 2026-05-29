import React, { useState, useCallback } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { Select, Spinner } from "@inkjs/ui";
import { Header } from "@/ink/components/Header";
import { StatusBar } from "@/ink/components/StatusBar";
import { useConfig } from "@/ink/hooks/useConfig";
import { InstanceSelectMenu } from "@/ink/components/InstanceSelectMenu";
import { useFadeIn } from "@/ink/hooks/useAnimations";
import { LEGACY_INSTANCE_VERSION } from "@/migration";
import {
  detectTemplateMismatch,
  detectWrapperMismatch,
  type TemplateMismatchStatus,
  type WrapperMismatchStatus,
} from "@/ink/util/instance-diagnostics";

type Step = "select" | "info" | "actions" | "executing" | "result";

type InfoData = {
  pluginCount: number | null;
  enabledCount: number | null;
  mcpCount: number | null;
  mcpPluginCount: number | null;
  mcpCustomCount: number | null;
};

const DetailRow: React.FC<{ label: string; value: string; color?: string; last?: boolean; delay?: number }> = ({
  label, value, color, last, delay = 0,
}) => {
  const visible = useFadeIn(delay);
  if (!visible) return null;
  return (
    <Box gap={1}>
      <Text dimColor>{last ? "└─" : "├─"}</Text>
      <Text dimColor bold>{label}:</Text>
      {color ? <Text color={color}>{value}</Text> : <Text>{value}</Text>}
    </Box>
  );
};

const EMPTY_INFO: InfoData = {
  pluginCount: null,
  enabledCount: null,
  mcpCount: null,
  mcpPluginCount: null,
  mcpCustomCount: null,
};

const ACTION_VALUES = {
  SyncTemplate: "sync-template",
  UpdateWrapper: "update-wrapper",
  OverrideWrapper: "override-wrapper",
  Back: "back",
} as const;

function templateStatusLabel(status: TemplateMismatchStatus): string {
  switch (status) {
    case "match": return "✓ up to date";
    case "mismatch": return "⚠ mismatch detected";
    case "unknown": return "? unknown";
  }
}

function wrapperStatusLabel(status: WrapperMismatchStatus): string {
  switch (status) {
    case "match": return "✓ up to date";
    case "mismatch": return "⚠ mismatch detected";
    case "missing": return "✗ wrapper missing";
    case "unknown": return "? unknown";
  }
}

export const ShowInstanceInfo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { exit } = useApp();
  const { instances, listInstancePlugins, getInstanceMcpServers, syncTemplateEnv, regenerateWrapper } = useConfig();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<typeof instances[0] | null>(null);
  const [infoData, setInfoData] = useState<InfoData>(EMPTY_INFO);
  const [templateStatus, setTemplateStatus] = useState<TemplateMismatchStatus>("unknown");
  const [wrapperStatus, setWrapperStatus] = useState<WrapperMismatchStatus>("unknown");
  const [providerName, setProviderName] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [executing, setExecuting] = useState(false);

  // Resolve the current instance from the live instances array so that
  // after reload() the selected reference stays fresh.
  const liveSelected = selected
    ? instances.find(i => i.name === selected.name) ?? selected
    : null;

  const runDiagnostics = useCallback((inst: typeof instances[0]) => {
    const tmpl = detectTemplateMismatch(inst);
    const wrap = detectWrapperMismatch(inst);
    setTemplateStatus(tmpl.status);
    setWrapperStatus(wrap.status);
    setProviderName(tmpl.providerName);
  }, []);

  const loadInstanceInfo = useCallback(async (inst: typeof instances[0]) => {
    try {
      const plugins = listInstancePlugins(inst.configDir);
      const mcpData = await getInstanceMcpServers(inst.configDir);
      setInfoData({
        pluginCount: plugins.length,
        enabledCount: plugins.filter(p => p.enabled).length,
        mcpPluginCount: Object.keys(mcpData.fromPlugins).length,
        mcpCustomCount: Object.keys(mcpData.fromSettings).length,
        mcpCount: Object.keys(mcpData.all).length,
      });
    } catch {
      setInfoData(EMPTY_INFO);
    }
  }, [listInstancePlugins, getInstanceMcpServers]);

  useInput((input, key) => {
    // Block ALL input while an action is executing
    if (executing) return;

    // q to quit — consistent with useNavigation used by all other screens
    if (input === "q") {
      exit();
      return;
    }

    if (key.escape) {
      if (step === "info") {
        setStep("select");
        setSelected(null);
      } else if (step === "actions") {
        setStep("info");
      } else if (step === "result") {
        goToInfo();
      } else {
        onBack();
      }
    } else if (key.return) {
      if (step === "info") {
        setStep("actions");
      } else if (step === "result") {
        goToInfo();
      }
    }
  });

  /** Refresh diagnostics and instance info, then go to the "info" step. */
  const goToInfo = () => {
    const inst = liveSelected;
    if (inst) {
      runDiagnostics(inst);
      loadInstanceInfo(inst);
    }
    setStep("info");
  };

  if (instances.length === 0) {
    return (
      <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
        <Header title="ℹ️ Instance Details" />
        <Text color="yellow">No instances found.</Text>
        <Box marginTop={1}>
          <Text dimColor>ESC to go back</Text>
        </Box>
      </Box>
    );
  }

  const handleInstanceSelect = async (value: string) => {
    const inst = instances.find((i) => i.name === value);
    if (!inst) return;
    setSelected(inst);
    setStep("info");

    runDiagnostics(inst);
    await loadInstanceInfo(inst);
  };

  const handleAction = async (value: string) => {
    // Guard against double-fire from rapid Enter presses
    if (executing) return;
    if (value === ACTION_VALUES.Back || !selected) {
      setStep("info");
      return;
    }

    setActionResult(null);
    setExecuting(true);
    setStep("executing");

    try {
      if (value === ACTION_VALUES.SyncTemplate) {
        await syncTemplateEnv(liveSelected ?? selected);
        setActionResult({ message: `Settings template updated for '${selected.name}'`, type: "success" });
      } else if (value === ACTION_VALUES.UpdateWrapper || value === ACTION_VALUES.OverrideWrapper) {
        await regenerateWrapper(liveSelected ?? selected);
        setActionResult({ message: `Alias wrapper regenerated for '${selected.name}'`, type: "success" });
      }
    } catch (err: unknown) {
      setActionResult({
        message: err instanceof Error ? err.message : String(err),
        type: "error",
      });
    }

    setExecuting(false);
    setStep("result");
  };

  const buildActionOptions = (): Array<{ label: string; value: string }> => {
    const options: Array<{ label: string; value: string }> = [];

    // Only show template sync when a provider is detected — it will always
    // fail for instances without a provider template
    if (providerName) {
      options.push({
        label: `🔄 Update settings template  [${templateStatusLabel(templateStatus)}]`,
        value: ACTION_VALUES.SyncTemplate,
      });
    }

    options.push({
      label: `🔧 Update alias wrapper  [${wrapperStatusLabel(wrapperStatus)}]`,
      value: ACTION_VALUES.UpdateWrapper,
    });

    // Show override option only when wrapper is mismatched or missing
    if (wrapperStatus === "mismatch" || wrapperStatus === "missing") {
      options.push({
        label: `🔨 Override alias to standard`,
        value: ACTION_VALUES.OverrideWrapper,
      });
    }

    options.push({ label: "← Back", value: ACTION_VALUES.Back });
    return options;
  };

  // Compute which DetailRow is the last visible one so it gets "└─"
  const hasPlugins = infoData.pluginCount !== null;
  const hasMcp = infoData.mcpCount !== null;
  const hasProvider = providerName !== null;
  // Last visible row priority: MCP > Plugins > Provider > Version
  const lastRow = hasMcp ? "mcp" : hasPlugins ? "plugins" : hasProvider ? "provider" : "version";

  // Use liveSelected for display to avoid stale data after reload
  const displayInstance = liveSelected ?? selected;

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="ℹ️ Instance Details" />

      {step === "select" && (
        <InstanceSelectMenu instances={instances} onSelect={handleInstanceSelect} />
      )}

      {step === "info" && displayInstance && (
        <Box flexDirection="column" gap={0}>
          <Box gap={1}>
            <Text color="cyan">●</Text>
            <Text bold color="cyan">{displayInstance.name}</Text>
          </Box>
          <Box marginLeft={2} flexDirection="column">
            <DetailRow label="Binary" value={displayInstance.binaryPath} delay={50} />
            <DetailRow label="Config" value={displayInstance.configDir} delay={100} />
            <DetailRow label="Created" value={new Date(displayInstance.createdAt).toLocaleString()} delay={150} />
            <DetailRow
              label="Auto-sync"
              value={displayInstance.autoSync !== false ? "✓ Enabled" : "✗ Disabled"}
              color={displayInstance.autoSync !== false ? "green" : "red"}
              delay={200}
            />
            <DetailRow
              label="Version"
              value={displayInstance.createdWithVersion === LEGACY_INSTANCE_VERSION
                ? "before version tracking"
                : displayInstance.createdWithVersion}
              color={displayInstance.createdWithVersion === LEGACY_INSTANCE_VERSION ? "yellow" : undefined}
              last={lastRow === "version"}
              delay={250}
            />
            {hasProvider && (
              <DetailRow
                label="Provider"
                value={providerName!}
                color={templateStatus === "match" ? undefined : templateStatus === "mismatch" ? "yellow" : undefined}
                last={lastRow === "provider"}
                delay={275}
              />
            )}
            {hasPlugins && (
              <DetailRow
                label="Plugins"
                value={`${infoData.pluginCount} installed, ${infoData.enabledCount} enabled`}
                last={lastRow === "plugins"}
                delay={300}
              />
            )}
            {hasMcp && (
              <DetailRow
                label="MCP Servers"
                value={`${infoData.mcpCount} total (${infoData.mcpPluginCount} from plugins, ${infoData.mcpCustomCount} custom)`}
                last={lastRow === "mcp"}
                delay={350}
              />
            )}
          </Box>
        </Box>
      )}

      {step === "actions" && displayInstance && (
        <Box flexDirection="column" gap={1}>
          <Box gap={1}>
            <Text color="cyan">●</Text>
            <Text bold color="cyan">{displayInstance.name}</Text>
          </Box>
          <Box marginTop={1}>
            <Text bold>Actions:</Text>
          </Box>
          {(() => {
            const actionOptions = buildActionOptions();
            return (
              <Select
                options={actionOptions}
                visibleOptionCount={actionOptions.length}
                onChange={handleAction}
              />
            );
          })()}
        </Box>
      )}

      {step === "executing" && displayInstance && (
        <Box flexDirection="column" gap={1}>
          <Box gap={1}>
            <Text color="cyan">●</Text>
            <Text bold color="cyan">{displayInstance.name}</Text>
          </Box>
          <Box marginTop={1}>
            <Spinner label="Updating..." />
          </Box>
        </Box>
      )}

      {step === "result" && displayInstance && actionResult && (
        <Box flexDirection="column" gap={1}>
          <Box gap={1}>
            <Text color="cyan">●</Text>
            <Text bold color="cyan">{displayInstance.name}</Text>
          </Box>
          <Box marginTop={1}>
            <StatusBar message={actionResult.message} type={actionResult.type} />
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        {step === "info" && (
          <Box gap={2}>
            <Text dimColor>Enter for actions</Text>
            <Text dimColor>ESC to go back</Text>
            <Text dimColor>q quit</Text>
          </Box>
        )}
        {step === "actions" && (
          <Text dimColor>↑↓ navigate │ Enter select │ ESC back │ q quit</Text>
        )}
        {step === "result" && (
          <Box gap={2}>
            <Text dimColor>Enter/ESC to return</Text>
            <Text dimColor>q quit</Text>
          </Box>
        )}
        {step === "select" && (
          <Text dimColor>ESC to go back │ q quit</Text>
        )}
      </Box>
    </Box>
  );
};
