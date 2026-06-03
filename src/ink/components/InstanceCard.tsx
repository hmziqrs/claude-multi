import React from "react";
import { Box, Text } from "ink";
import { useFadeIn, usePulse } from "@/ink/hooks/useAnimations";
import type { Instance } from "@/config";
import { getSyncMode, syncModeLabel } from "@/config";
import { SyncMode, type SyncMode as SyncModeType } from "@/constants";
import { LEGACY_INSTANCE_VERSION } from "@/migration";

function syncModeIcon(mode: SyncModeType): string {
  switch (mode) {
    case SyncMode.Auto: return "⚡";
    case SyncMode.HalfManual: return "🔗";
    case SyncMode.FullManual: return "📦";
  }
}

function syncModeColor(mode: SyncModeType): string {
  switch (mode) {
    case SyncMode.Auto: return "green";
    case SyncMode.HalfManual: return "cyan";
    case SyncMode.FullManual: return "yellow";
  }
}

export const InstanceCard: React.FC<{ instance: Instance; index?: number }> = ({
  instance,
  index = 0,
}) => {
  const mode = getSyncMode(instance);
  const visible = useFadeIn(index * 60 + 50);
  const pulse = usePulse(mode === SyncMode.Auto ? ["●", "◉", "●"] : mode === SyncMode.HalfManual ? ["◐", "◑", "◐"] : ["○", "◌", "○"], 800);

  if (!visible) return null;

  const verLabel = instance.createdWithVersion === LEGACY_INSTANCE_VERSION
    ? "before version tracking"
    : instance.createdWithVersion;

  return (
    <Box flexDirection="column" marginTop={0} marginBottom={0}>
      <Box gap={1}>
        <Text color={syncModeColor(mode)}>{pulse}</Text>
        <Text bold>{instance.name}</Text>
        <Text dimColor>{syncModeIcon(mode)} {mode}</Text>
      </Box>
      <Box marginLeft={2} flexDirection="column">
        <Box gap={1}>
          <Text dimColor>├─</Text>
          <Text dimColor bold>bin</Text>
          <Text dimColor>{instance.binaryPath}</Text>
        </Box>
        <Box gap={1}>
          <Text dimColor>├─</Text>
          <Text dimColor bold>cfg</Text>
          <Text dimColor>{instance.configDir}</Text>
        </Box>
        <Box gap={1}>
          <Text dimColor>└─</Text>
          <Text dimColor bold>ver</Text>
          <Text dimColor>{verLabel}</Text>
        </Box>
      </Box>
    </Box>
  );
};
