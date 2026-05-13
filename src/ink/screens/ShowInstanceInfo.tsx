import React, { useState } from "react";
import { Box, Text } from "ink";
import { Select } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { useNavigation } from "../hooks/useNavigation.js";
import { useConfig } from "../hooks/useConfig.js";
import { useFadeIn, useStaggeredReveal } from "../hooks/useAnimations.js";

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
  const { instances } = useConfig();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<typeof instances[0] | null>(null);

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

  const instanceOptions = instances.map((i) => ({ label: i.name, value: i.name }));

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="ℹ️ Instance Details" />

      {step === "select" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select an instance:</Text>
          <Select
            options={instanceOptions}
            visibleOptionCount={instanceOptions.length}
            onChange={(value) => {
              const inst = instances.find((i) => i.name === value);
              if (inst) {
                setSelected(inst);
                setStep("info");
              }
            }}
          />
        </Box>
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
              last
              delay={200}
            />
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC to go back</Text>
      </Box>
    </Box>
  );
};
