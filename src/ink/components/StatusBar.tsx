import React from "react";
import { Box, Text } from "ink";

export const StatusBar: React.FC<{
  message: string;
  type?: "success" | "error" | "warning" | "info";
}> = ({ message, type = "info" }) => {
  const colors = { success: "green", error: "red", warning: "yellow", info: "gray" } as const;
  const icons = { success: "✓", error: "✗", warning: "⚠", info: "ℹ" } as const;
  const bgColors = { success: "green", error: "red", warning: "yellow", info: "blue" } as const;

  return (
    <Box
      borderStyle="round"
      borderColor={colors[type]}
      paddingX={1}
      marginBottom={1}
    >
      <Text color={colors[type]} bold>
        {icons[type]} {message}
      </Text>
    </Box>
  );
};
