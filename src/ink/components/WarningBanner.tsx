import React from "react";
import { Box, Text } from "ink";
import { useFadeIn, usePulse } from "@/ink/hooks/useAnimations";

interface WarningBannerProps {
  issueCount: number;
  errorCount: number;
  warningCount: number;
  hasVersionIssues?: boolean;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({
  issueCount,
  errorCount,
  warningCount,
  hasVersionIssues = false,
}) => {
  const visible = useFadeIn(200);
  const icon = usePulse(["⚠", "⚠", " "], 1000);

  if (!visible || issueCount === 0) return null;

  const parts: string[] = [];
  if (errorCount > 0) parts.push(`${errorCount} error${errorCount > 1 ? "s" : ""}`);
  if (warningCount > 0) parts.push(`${warningCount} warning${warningCount > 1 ? "s" : ""}`);

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color="yellow">{icon} </Text>
        <Text color="yellow" bold>{parts.join(", ")}</Text>
        <Text color="yellow">, press </Text>
        <Text color="yellow" bold>!</Text>
        <Text color="yellow"> to review</Text>
      </Box>
      {hasVersionIssues && (
        <Box>
          <Text color="red">  ⚠ Some instances have version issues. </Text>
          <Text color="red" bold>Press ! to review and fix.</Text>
        </Box>
      )}
    </Box>
  );
};
