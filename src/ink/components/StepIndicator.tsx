import React from "react";
import { Box, Text } from "ink";

export const StepIndicator: React.FC<{
  current: number;
  total: number;
  label: string;
}> = ({ current, total, label }) => (
  <Box marginBottom={1}>
    <Text dimColor>
      Step {current}/{total}: {label}
    </Text>
  </Box>
);
