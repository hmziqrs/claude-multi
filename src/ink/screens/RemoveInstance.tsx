import React, { useState } from "react";
import { Box, Text } from "ink";
import { Select, ConfirmInput } from "@inkjs/ui";
import { Header } from "@/ink/components/Header";
import { StatusBar } from "@/ink/components/StatusBar";
import { useNavigation } from "@/ink/hooks/useNavigation";
import { useConfig } from "@/ink/hooks/useConfig";
import { useFadeIn } from "@/ink/hooks/useAnimations";

type Step = "select" | "confirm" | "removing" | "done";

const RemoveConfirm: React.FC<{
  selected: { name: string; binaryPath: string; configDir: string };
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ selected, onConfirm, onCancel }) => {
  const showWarning = useFadeIn(50);
  const showDetails = useFadeIn(120);
  const showConfirm = useFadeIn(250);

  return (
    <Box flexDirection="column" gap={1}>
      {showWarning && (
        <Box gap={1}>
          <Text bold color="red">⚠ About to remove</Text>
          <Text bold color="red">'{selected.name}'</Text>
        </Box>
      )}
      {showDetails && (
        <>
          <Box marginLeft={2} flexDirection="column">
            <Box gap={1}>
              <Text dimColor>├─</Text>
              <Text dimColor bold>Binary:</Text>
              <Text dimColor>{selected.binaryPath}</Text>
            </Box>
            <Box gap={1}>
              <Text dimColor>└─</Text>
              <Text dimColor bold>Config:</Text>
              <Text dimColor>{selected.configDir}</Text>
            </Box>
          </Box>
          <Text dimColor>Config directory will NOT be deleted automatically.</Text>
        </>
      )}
      {showConfirm && (
        <>
          <Text>Confirm removal?</Text>
          <ConfirmInput
            defaultChoice="cancel"
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        </>
      )}
    </Box>
  );
};

export const RemoveInstance: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { instances, reload } = useConfig();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<typeof instances[0] | null>(null);
  const [error, setError] = useState("");
  const [removedConfig, setRemovedConfig] = useState("");

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
      <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
        <Header title="🗑️ Remove Instance" />
        <Text color="yellow">No instances found.</Text>
        <Box marginTop={1}><Text dimColor>ESC to go back</Text></Box>
      </Box>
    );
  }

  const instanceOptions = instances.map((i) => ({
    label: `${i.name} (${i.configDir})`,
    value: i.name,
  }));

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
      const { removeInstance } = await import("@/config");
      const { removeWrapper } = await import("@/wrapper");
      const instance = await removeInstance(selected.name);
      if (instance) removeWrapper(instance.binaryPath);
      await reload();
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setStep("select");
    }
  };

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🗑️ Remove Instance" />

      {error && <StatusBar message={error} type="error" />}

      {step === "select" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select an instance to remove:</Text>
          <Select
            options={instanceOptions}
            visibleOptionCount={instanceOptions.length}
            onChange={handleSelect}
          />
        </Box>
      )}

      {step === "confirm" && selected && (
        <RemoveConfirm
          selected={selected}
          onConfirm={() => handleConfirm(true)}
          onCancel={() => handleConfirm(false)}
        />
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
