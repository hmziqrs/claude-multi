import React from "react";
import { Box, Text } from "ink";
import { useFadeIn, usePulse } from "@/ink/hooks/useAnimations";

interface WarningBannerProps {
  issueCount: number;
  errorCount: number;
  warningCount: number;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({
  issueCount,
  errorCount,
  warningCount,
}) => {
  const visible = useFadeIn(200);
  const icon = usePulse(["⚠", "⚠", " "], 1000);

  if (!visible || issueCount === 0) return null;

  const parts: string[] = [];
  if (errorCount > 0) parts.push(`${errorCount} error${errorCount > 1 ? "s" : ""}`);
  if (warningCount > 0) parts.push(`${warningCount} warning${warningCount > 1 ? "s" : ""}`);

  return (
    <Box marginBottom={1}>
      <Text color="yellow">{icon} </Text>
      <Text color="yellow" bold>{parts.join(", ")}</Text>
      <Text color="yellow"> — press </Text>
      <Text color="yellow" bold>!</Text>
      <Text color="yellow"> to review</Text>
    </Box>
  );
};
