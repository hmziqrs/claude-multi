import React from "react";
import { Box, Text } from "ink";

export const Footer: React.FC = () => (
  <Box marginTop={1}>
    <Text color="gray">↑↓</Text>
    <Text dimColor> navigate </Text>
    <Text color="gray">↵</Text>
    <Text dimColor> select </Text>
    <Text color="gray">esc</Text>
    <Text dimColor> back </Text>
    <Text color="gray">q</Text>
    <Text dimColor> quit</Text>
  </Box>
);
