import React from "react";
import { Box, Text } from "ink";
import { useDrawLine, useFadeIn } from "@/ink/hooks/useAnimations";

export const Footer: React.FC<{ showHealthHint?: boolean }> = ({ showHealthHint }) => {
  const lineLen = 60;
  const lineProgress = useDrawLine(lineLen, 0, 4);
  const showHints = useFadeIn(100);

  return (
    <Box flexDirection="column" width="100" marginTop={1}>
      <Text dimColor>{"─".repeat(lineProgress)}</Text>
      {showHints && (
        <Box gap={2}>
          <Box><Text color="gray">↑↓</Text><Text dimColor> navigate</Text></Box>
          <Box><Text color="gray">↵</Text><Text dimColor> select</Text></Box>
          <Box><Text color="gray">esc</Text><Text dimColor> back</Text></Box>
          {showHealthHint && <Box><Text color="gray">!</Text><Text dimColor> health</Text></Box>}
          <Box><Text color="gray">q</Text><Text dimColor> quit</Text></Box>
        </Box>
      )}
    </Box>
  );
};
