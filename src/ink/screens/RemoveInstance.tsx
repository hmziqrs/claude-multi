import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Select, ConfirmInput } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { StatusBar } from "../components/StatusBar.js";
import { useNavigation } from "../hooks/useNavigation.js";
import { useConfig } from "../hooks/useConfig.js";

type Step = "select" | "confirm" | "removing" | "done";

export const RemoveInstance: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { exit } = useApp();
  const { instances, reload } = useConfig();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<typeof instances[0] | null>(null);
  const [error, setError] = useState("");
  const [removedConfig, setRemovedConfig] = useState("");

  // ESC navigates back contextually
  useNavigation(() => {
    if (step === "confirm") {
      setStep("select");
      setSelected(null);
    } else if (step === "done") {
      onBack();
    } else {
      onBack();
    }
  });

  if (instances.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Header title="🗑️ Remove Instance" />
        <Text color="yellow">No instances found.</Text>
        <Box marginTop={1}><Text dimColor>ESC to go back</Text></Box>
      </Box>
    );
  }

  const handleSelect = (value: string) => {
    const inst = instances.find((i) => i.name === value);
    if (inst) {
      setSelected(inst);
      setStep("confirm");
    }
  };

  const handleConfirm = async (confirmed: boolean) => {
    if (!confirmed) {
      setStep("select");
      setSelected(null);
      return;
    }
    if (!selected) return;
    setStep("removing");

    try {
      setRemovedConfig(selected.configDir);
      const { removeInstance } = await import("../../config.js");
      const { removeWrapper } = await import("../../wrapper.js");
      const instance = await removeInstance(selected.name);
      if (instance) removeWrapper(instance.binaryPath);
      await reload();
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
      setStep("select");
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="🗑️ Remove Instance" />

      {error && <StatusBar message={error} type="error" />}

      {step === "select" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select an instance to remove:</Text>
          <Select
            options={instances.map((i) => ({
              label: `${i.name} (${i.configDir})`,
              value: i.name,
            }))}
            onChange={handleSelect}
          />
        </Box>
      )}

      {step === "confirm" && selected && (
        <Box flexDirection="column" gap={1}>
          <Box borderStyle="round" borderColor="red" paddingX={1} flexDirection="column">
            <Text bold color="red">⚠ About to remove '{selected.name}'</Text>
          </Box>
          <Box marginLeft={2} flexDirection="column">
            <Box gap={2}>
              <Text dimColor bold>Binary:</Text>
              <Text dimColor>{selected.binaryPath}</Text>
            </Box>
            <Box gap={2}>
              <Text dimColor bold>Config:</Text>
              <Text dimColor>{selected.configDir}</Text>
            </Box>
          </Box>
          <Text dimColor>Config directory will NOT be deleted automatically.</Text>
          <Text>Confirm removal?</Text>
          <ConfirmInput
            defaultChoice="cancel"
            onConfirm={() => handleConfirm(true)}
            onCancel={() => handleConfirm(false)}
          />
        </Box>
      )}

      {step === "removing" && <Text dimColor>Removing...</Text>}

      {step === "done" && selected && (
        <Box flexDirection="column" gap={1}>
          <StatusBar message={`'${selected.name}' removed successfully!`} type="success" />
          <Text dimColor>To delete config: rm -rf {removedConfig}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
