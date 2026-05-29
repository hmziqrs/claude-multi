import React from "react";
import { Box, Text } from "ink";
import { useFadeIn, usePulse } from "@/ink/hooks/useAnimations";
import type { Instance } from "@/config";

export const InstanceCard: React.FC<{ instance: Instance; index?: number }> = ({
  instance,
  index = 0,
}) => {
  const autoSyncOn = instance.autoSync !== false;
  const visible = useFadeIn(index * 60 + 50);
  const pulse = usePulse(autoSyncOn ? ["●", "◉", "●"] : ["○", "◌", "○"], 800);

  if (!visible) return null;

  const verLabel = instance.createdWithVersion === "0.5"
    ? "before version tracking"
    : instance.createdWithVersion;

  return (
    <Box flexDirection="column" marginTop={0} marginBottom={0}>
      <Box gap={1}>
        <Text color={autoSyncOn ? "green" : "yellow"}>{autoSyncOn ? pulse : "○"}</Text>
        <Text bold>{instance.name}</Text>
        <Text dimColor>{autoSyncOn ? "synced" : "manual"}</Text>
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
