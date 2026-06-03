import React, { useState } from "react";
import { Box, Text } from "ink";
import { Select } from "@inkjs/ui";
import { Header } from "@/ink/components/Header";
import { StatusBar } from "@/ink/components/StatusBar";
import { useNavigation } from "@/ink/hooks/useNavigation";
import { useConfig } from "@/ink/hooks/useConfig";
import { useMessage } from "@/ink/hooks/useMessage";
import { useFadeIn } from "@/ink/hooks/useAnimations";
import { SyncMode, type SyncMode as SyncModeType, canConvertSyncMode, availableSyncModeConversions, SYNC_MODE_ORDER } from "@/constants";
import { getSyncMode, syncModeLabel, type Instance } from "@/config";

type Step = "select" | "action" | "syncing" | "done";

function syncModeColor(mode: SyncModeType): string {
  switch (mode) {
    case SyncMode.Auto: return "green";
    case SyncMode.HalfManual: return "cyan";
    case SyncMode.FullManual: return "yellow";
  }
}

function syncModeIcon(mode: SyncModeType): string {
  switch (mode) {
    case SyncMode.Auto: return "⚡";
    case SyncMode.HalfManual: return "🔗";
    case SyncMode.FullManual: return "📦";
  }
}

const SyncModeAction: React.FC<{
  selected: Instance;
  actionOptions: { label: string; value: string }[];
  onAction: (value: string) => void;
}> = ({ selected, actionOptions, onAction }) => {
  const showStatus = useFadeIn(50);
  const showOptions = useFadeIn(150);
  const currentMode = getSyncMode(selected);

  return (
    <Box flexDirection="column" gap={1}>
      {showStatus && (
        <Box flexDirection="column" gap={0}>
          <Text>
            Sync mode for <Text bold color="cyan">{selected.name}</Text> is{" "}
            <Text bold color={syncModeColor(currentMode)}>
              {syncModeIcon(currentMode)} {syncModeLabel(currentMode)}
            </Text>
          </Text>
          {currentMode !== SyncMode.FullManual && (
            <Text dimColor>
              Can convert to: {availableSyncModeConversions(currentMode).map(m => syncModeLabel(m)).join(", ")}
            </Text>
          )}
        </Box>
      )}
      {showOptions && actionOptions.length > 1 && (
        <>
          <Text>What would you like to do?</Text>
          <Select
            options={actionOptions}
            visibleOptionCount={actionOptions.length}
            onChange={onAction}
          />
        </>
      )}
    </Box>
  );
};

export const ToggleAutoSync: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { instances, toggleSyncMode } = useConfig();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<typeof instances[0] | null>(null);
  const { error, setError } = useMessage();
  const [newMode, setNewMode] = useState<SyncModeType>(SyncMode.Auto);

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
      <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
        <Header title="🔄 Sync Mode" />
        <Text color="yellow">No instances found.</Text>
        <Box marginTop={1}><Text dimColor>ESC to go back</Text></Box>
      </Box>
    );
  }

  const instanceOptions = instances.map((i) => {
    const mode = getSyncMode(i);
    return {
      label: `${i.name} (${syncModeIcon(mode)} ${syncModeLabel(mode)})`,
      value: i.name,
    };
  });

  const handleSelect = (value: string) => {
    const inst = instances.find((i) => i.name === value);
    if (inst) {
      setSelected(inst);
      setStep("action");
    }
  };

  const VALID_MODES = new Set<string>(Object.values(SyncMode));

  const handleAction = async (value: string) => {
    if (value === "cancel" || !selected) {
      setStep("select");
      setSelected(null);
      return;
    }

    // Validate the mode value before casting
    if (!VALID_MODES.has(value)) {
      setError(`Invalid sync mode: ${value}`);
      setStep("select");
      return;
    }

    const targetMode = value as SyncModeType;

    setStep("syncing");
    try {
      await toggleSyncMode(selected.name, targetMode);
      setNewMode(targetMode);
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setStep("select");
    }
  };

  const buildActionOptions = (): { label: string; value: string }[] => {
    if (!selected) return [{ label: "Cancel", value: "cancel" }];

    const currentMode = getSyncMode(selected);
    const options: { label: string; value: string }[] = [];

    // Re-sync (only for auto mode)
    if (currentMode === SyncMode.Auto) {
      options.push({ label: "⚡ Force re-sync (rebuild symlinks)", value: SyncMode.Auto });
    }

    // Available downgrades
    const downgrades = availableSyncModeConversions(currentMode);
    for (const mode of downgrades) {
      options.push({
        label: `${syncModeIcon(mode)} Convert to ${syncModeLabel(mode)}`,
        value: mode,
      });
    }

    if (options.length === 0) {
      options.push({ label: "(already at most isolated mode)", value: "cancel" });
    }

    options.push({ label: "Cancel", value: "cancel" });
    return options;
  };

  const actionOptions = buildActionOptions();

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🔄 Sync Mode" />

      {error && <StatusBar message={error} type="error" />}

      {step === "select" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select an instance:</Text>
          <Select
            options={instanceOptions}
            visibleOptionCount={instanceOptions.length}
            onChange={handleSelect}
          />
        </Box>
      )}

      {step === "action" && selected && (
        <SyncModeAction
          selected={selected}
          actionOptions={actionOptions}
          onAction={handleAction}
        />
      )}

      {step === "syncing" && <Text dimColor>Converting sync mode…</Text>}

      {step === "done" && selected && (
        <StatusBar
          message={`Sync mode set to ${syncModeIcon(newMode)} ${syncModeLabel(newMode)} for '${selected.name}'`}
          type="success"
        />
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
