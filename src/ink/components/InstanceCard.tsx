import React from "react";
import { Box, Text } from "ink";
import type { Instance } from "../../config.js";

export const InstanceCard: React.FC<{ instance: Instance }> = ({ instance }) => {
  const autoSyncOn = instance.autoSync !== false;
  return (
    <Box flexDirection="column" marginLeft={2} marginY={0}>
      <Box gap={1}>
        <Text color="cyan">●</Text>
        <Text bold>{instance.name}</Text>
        <Text dimColor>{autoSyncOn ? "synced" : "manual"}</Text>
      </Box>
      <Box marginLeft={2} flexDirection="column">
        <Box gap={1}>
          <Text dimColor bold>bin</Text>
          <Text dimColor>{instance.binaryPath}</Text>
        </Box>
        <Box gap={1}>
          <Text dimColor bold>cfg</Text>
          <Text dimColor>{instance.configDir}</Text>
        </Box>
      </Box>
    </Box>
  );
};
