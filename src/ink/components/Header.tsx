import React from "react";
import { Box, Text, useWindowSize } from "ink";
import { useTypewriter, useDrawLine } from "@/ink/hooks/useAnimations";

export const Header: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const { columns = 80 } = useWindowSize();
  const lineLen = Math.max(20, Math.min(columns - 4, 60));
  const typedTitle = useTypewriter(title, 20);
  const lineProgress = useDrawLine(lineLen, typedTitle.length * 20, 3);

  return (
    <Box flexDirection="column" width="100" marginBottom={1}>
      <Box>
        <Text bold color="cyan">{typedTitle}</Text>
        {subtitle && typedTitle.length === title.length && (
          <Text dimColor>: {subtitle}</Text>
        )}
      </Box>
      {lineProgress > 0 && (
        <Text color="cyan">{"─".repeat(lineProgress)}</Text>
      )}
    </Box>
  );
};
