import React, { useState } from "react";
import { Box, Text } from "ink";
import { Select } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { useNavigation } from "../hooks/useNavigation.js";
import { useConfig } from "../hooks/useConfig.js";

type Step = "select" | "info";

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
      <Box flexDirection="column" padding={1}>
        <Header title="ℹ️ Instance Details" />
        <Text color="yellow">No instances found.</Text>
        <Box marginTop={1}>
          <Text dimColor>ESC to go back</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="ℹ️ Instance Details" />

      {step === "select" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select an instance:</Text>
          <Select
            options={instances.map((i) => ({ label: i.name, value: i.name }))}
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
        <Box flexDirection="column" gap={1}>
          <Box borderStyle="round" borderColor="cyan" paddingX={1}>
            <Text bold>
              <Text color="cyan">{selected.name}</Text>
            </Text>
          </Box>
          <Box marginLeft={2} flexDirection="column" gap={0}>
            <Box gap={2}>
              <Text dimColor bold>Binary:</Text>
              <Text>{selected.binaryPath}</Text>
            </Box>
            <Box gap={2}>
              <Text dimColor bold>Config:</Text>
              <Text>{selected.configDir}</Text>
            </Box>
            <Box gap={2}>
              <Text dimColor bold>Created:</Text>
              <Text>{new Date(selected.createdAt).toLocaleString()}</Text>
            </Box>
            <Box gap={2}>
              <Text dimColor bold>Auto-sync:</Text>
              <Text color={selected.autoSync !== false ? "green" : "red"}>
                {selected.autoSync !== false ? "✓ Enabled" : "✗ Disabled"}
              </Text>
            </Box>
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC to go back</Text>
      </Box>
    </Box>
  );
};
