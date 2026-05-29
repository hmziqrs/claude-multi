import React, { useState } from "react";
import { Box, Text } from "ink";
import { Header } from "@/ink/components/Header";
import { useNavigation } from "@/ink/hooks/useNavigation";
import { useConfig } from "@/ink/hooks/useConfig";
import { InstanceSelectMenu } from "@/ink/components/InstanceSelectMenu";
import { useFadeIn } from "@/ink/hooks/useAnimations";
import { LEGACY_INSTANCE_VERSION } from "@/migration";

type Step = "select" | "info";

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

export const ShowInstanceInfo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { instances, listInstancePlugins, getInstanceMcpServers } = useConfig();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<typeof instances[0] | null>(null);
  const [infoData, setInfoData] = useState<InfoData>(EMPTY_INFO);

  useNavigation(() => {
    if (step === "info") {
      setStep("select");
      setSelected(null);
    } else {
      onBack();
    }
  });

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

    // Load plugin/MCP data async
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
  };

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="ℹ️ Instance Details" />

      {step === "select" && (
        <InstanceSelectMenu instances={instances} onSelect={handleInstanceSelect} />
      )}

      {step === "info" && selected && (
        <Box flexDirection="column" gap={0}>
          <Box gap={1}>
            <Text color="cyan">●</Text>
            <Text bold color="cyan">{selected.name}</Text>
          </Box>
          <Box marginLeft={2} flexDirection="column">
            <DetailRow label="Binary" value={selected.binaryPath} delay={50} />
            <DetailRow label="Config" value={selected.configDir} delay={100} />
            <DetailRow label="Created" value={new Date(selected.createdAt).toLocaleString()} delay={150} />
            <DetailRow
              label="Auto-sync"
              value={selected.autoSync !== false ? "✓ Enabled" : "✗ Disabled"}
              color={selected.autoSync !== false ? "green" : "red"}
              delay={200}
            />
            <DetailRow
              label="Version"
              value={selected.createdWithVersion === LEGACY_INSTANCE_VERSION
                ? "before version tracking"
                : selected.createdWithVersion}
              color={selected.createdWithVersion === LEGACY_INSTANCE_VERSION ? "yellow" : undefined}
              delay={250}
            />
            {infoData.pluginCount !== null && (
              <DetailRow
                label="Plugins"
                value={`${infoData.pluginCount} installed, ${infoData.enabledCount} enabled`}
                delay={300}
              />
            )}
            {infoData.mcpCount !== null && (
              <DetailRow
                label="MCP Servers"
                value={`${infoData.mcpCount} total (${infoData.mcpPluginCount} from plugins, ${infoData.mcpCustomCount} custom)`}
                last
                delay={350}
              />
            )}
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC to go back</Text>
      </Box>
    </Box>
  );
};
