import React, { useState } from "react";
import { Box, Text } from "ink";
import { Select } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { StatusBar } from "../components/StatusBar.js";
import { useNavigation } from "../hooks/useNavigation.js";
import { useConfig } from "../hooks/useConfig.js";

type Step = "select" | "action" | "syncing" | "done";

export const ToggleAutoSync: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { instances, toggleAutoSync } = useConfig();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<typeof instances[0] | null>(null);
  const [error, setError] = useState("");
  const [newStatus, setNewStatus] = useState(false);

  useNavigation(() => {
    if (step === "action") {
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
        <Header title="🔄 Toggle Auto-Sync" />
        <Text color="yellow">No instances found.</Text>
        <Box marginTop={1}><Text dimColor>ESC to go back</Text></Box>
      </Box>
    );
  }

  const handleSelect = (value: string) => {
    const inst = instances.find((i) => i.name === value);
    if (inst) {
      setSelected(inst);
      setStep("action");
    }
  };

  const handleAction = async (value: string) => {
    if (value === "cancel" || !selected) {
      setStep("select");
      setSelected(null);
      return;
    }

    const currentStatus = selected.autoSync !== false;
    const nextStatus = value === "force-sync" ? true : !currentStatus;

    setStep("syncing");
    try {
      await toggleAutoSync(selected.name, nextStatus);
      setNewStatus(nextStatus);
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
      setStep("select");
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="🔄 Toggle Auto-Sync" />

      {error && <StatusBar message={error} type="error" />}

      {step === "select" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select an instance:</Text>
          <Select
            options={instances.map((i) => ({
              label: `${i.name} (${i.autoSync !== false ? "on" : "off"})`,
              value: i.name,
            }))}
            onChange={handleSelect}
          />
        </Box>
      )}

      {step === "action" && selected && (
        <Box flexDirection="column" gap={1}>
          <Box marginLeft={2}>
            <Text>Auto-sync for <Text bold color="cyan">{selected.name}</Text> is currently <Text bold color={selected.autoSync !== false ? "green" : "red"}>{selected.autoSync !== false ? "ON" : "OFF"}</Text></Text>
          </Box>
          <Text>What would you like to do?</Text>
          <Select
            options={[
              {
                label: selected.autoSync !== false ? "Turn off (copy files locally)" : "Turn on (use symlinks)",
                value: "toggle",
              },
              ...(selected.autoSync !== false
                ? [{ label: "Force re-sync (rebuild symlinks)", value: "force-sync" }]
                : []),
              { label: "Cancel", value: "cancel" },
            ]}
            onChange={handleAction}
          />
        </Box>
      )}

      {step === "syncing" && <Text dimColor>Syncing...</Text>}

      {step === "done" && selected && (
        <StatusBar
          message={`Auto-sync ${newStatus ? "enabled" : "disabled"} for '${selected.name}'`}
          type="success"
        />
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
