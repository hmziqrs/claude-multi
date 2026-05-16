import React from "react";
import { Box, Text } from "ink";
import { Select } from "@inkjs/ui";
import type { Instance } from "@/ink/hooks/useConfig";

interface InstanceSelectMenuProps {
  instances: Instance[];
  label?: string;
  onSelect: (value: string) => void;
}

export const InstanceSelectMenu: React.FC<InstanceSelectMenuProps> = ({
  instances,
  label = "Select an instance:",
  onSelect,
}) => {
  const options = instances.map((i) => ({ label: i.name, value: i.name }));
  return (
    <Box flexDirection="column" gap={1}>
      <Text>{label}</Text>
      <Select options={options} visibleOptionCount={options.length} onChange={onSelect} />
    </Box>
  );
};
