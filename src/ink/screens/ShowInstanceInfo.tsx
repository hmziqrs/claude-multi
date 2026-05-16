import React, { useState } from "react";
import { Box, Text } from "ink";
import { Header } from "@/ink/components/Header";
import { useNavigation } from "@/ink/hooks/useNavigation";
import { useConfig } from "@/ink/hooks/useConfig";
import { InstanceSelectMenu } from "@/ink/components/InstanceSelectMenu";
import { useFadeIn } from "@/ink/hooks/useAnimations";

type Step = "select" | "info";

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

export const ShowInstanceInfo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { instances, listInstancePlugins, getInstanceMcpServers } = useConfig();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<typeof instances[0] | null>(null);
  const [pluginCount, setPluginCount] = useState<number | null>(null);
  const [enabledCount, setEnabledCount] = useState<number | null>(null);
  const [mcpCount, setMcpCount] = useState<number | null>(null);
  const [mcpPluginCount, setMcpPluginCount] = useState<number | null>(null);
  const [mcpCustomCount, setMcpCustomCount] = useState<number | null>(null);

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
      setPluginCount(plugins.length);
      setEnabledCount(plugins.filter(p => p.enabled).length);

      const mcpData = await getInstanceMcpServers(inst.configDir);
      setMcpPluginCount(Object.keys(mcpData.fromPlugins).length);
      setMcpCustomCount(Object.keys(mcpData.fromSettings).length);
      setMcpCount(Object.keys(mcpData.all).length);
    } catch {
      setPluginCount(null);
      setMcpCount(null);
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
            {pluginCount !== null && (
              <DetailRow
                label="Plugins"
                value={`${pluginCount} installed, ${enabledCount} enabled`}
                delay={250}
              />
            )}
            {mcpCount !== null && (
              <DetailRow
                label="MCP Servers"
                value={`${mcpCount} total (${mcpPluginCount} from plugins, ${mcpCustomCount} custom)`}
                last
                delay={300}
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
