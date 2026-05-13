import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { Header } from "../components/Header.js";
import { InstanceCard } from "../components/InstanceCard.js";
import { useNavigation } from "../hooks/useNavigation.js";
import type { Instance } from "../../config.js";
import { listInstances } from "../../config.js";

export const ListInstances: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  useNavigation(onBack);

  useEffect(() => {
    listInstances().then((insts) => {
      setInstances(insts);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Text dimColor>Loading...</Text>;
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="📋 All Instances" />

      {instances.length === 0 ? (
        <Box flexDirection="column" padding={1}>
          <Text color="yellow">No instances found.</Text>
          <Text dimColor>Create one with: claude-multi add &lt;name&gt;</Text>
        </Box>
      ) : (
        <Box flexDirection="column" gap={0}>
          <Text bold>Found {instances.length} instance(s):</Text>
          {instances.map((instance) => (
            <InstanceCard key={instance.name} instance={instance} />
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC to go back</Text>
      </Box>
    </Box>
  );
};
