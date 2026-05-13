import React from "react";
import { Box, Text } from "ink";
import { useTypewriter, useFadeIn } from "../hooks/useAnimations.js";

export const StepIndicator: React.FC<{
  current: number;
  total: number;
  label: string;
}> = ({ current, total, label }) => {
  const typedLabel = useTypewriter(label, 30);
  const visible = useFadeIn(100);
  if (!visible) return null;

  return (
    <Box marginBottom={1}>
      <Text color="cyan">[</Text>
      <Text bold color="cyan">{current}</Text>
      <Text color="cyan">/{total}]</Text>
      <Text> {typedLabel}</Text>
    </Box>
  );
};
