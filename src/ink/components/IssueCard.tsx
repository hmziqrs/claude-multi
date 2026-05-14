import React from "react";
import { Box, Text } from "ink";
import { useFadeIn } from "../hooks/useAnimations.js";
import type { HealthIssue } from "../../health.js";

const SEVERITY_ICONS: Record<string, string> = {
  error: "❌",
  warning: "⚠",
  info: "ℹ️",
};

const SEVERITY_COLORS: Record<string, string> = {
  error: "red",
  warning: "yellow",
  info: "gray",
};

export const IssueCard: React.FC<{ issue: HealthIssue; index: number }> = ({
  issue,
  index,
}) => {
  const visible = useFadeIn(index * 60 + 50);
  if (!visible) return null;

  const icon = SEVERITY_ICONS[issue.severity] ?? "•";
  const color = SEVERITY_COLORS[issue.severity] ?? "white";

  return (
    <Box flexDirection="column" marginLeft={2}>
      <Box gap={1}>
        <Text>{icon}</Text>
        <Text bold color={color}>{issue.title}</Text>
      </Box>
      <Box marginLeft={2}>
        <Text dimColor>{issue.message}</Text>
      </Box>
    </Box>
  );
};
