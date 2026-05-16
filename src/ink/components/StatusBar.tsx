import React from "react";
import { Box, Text } from "ink";
import { useFadeIn } from "@/ink/hooks/useAnimations";

export const StatusBar: React.FC<{
  message: string;
  type?: "success" | "error" | "warning" | "info";
}> = ({ message, type = "info" }) => {
  const colors = { success: "green", error: "red", warning: "yellow", info: "gray" } as const;
  const icons = { success: "✓", error: "✗", warning: "⚠", info: "ℹ" } as const;
  const visible = useFadeIn(50);

  if (!visible) return null;

  return (
    <Box marginBottom={1}>
      <Text color={colors[type]} bold>{icons[type]}</Text>
      <Text> {message}</Text>
    </Box>
  );
};
