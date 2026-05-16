import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { Header } from "@/ink/components/Header";
import { InstanceCard } from "@/ink/components/InstanceCard";
import { useNavigation } from "@/ink/hooks/useNavigation";
import { useStaggeredReveal, useCounter, useFadeIn } from "@/ink/hooks/useAnimations";
import type { Instance } from "@/config";
import { listInstances } from "@/config";

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

  const visibleCount = useStaggeredReveal(instances.length, 60);
  const countDisplay = useCounter(instances.length, 400);
  const showHint = useFadeIn(300);

  if (loading) {
    return <Text dimColor>Loading...</Text>;
  }

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="📋 All Instances" />

      {instances.length === 0 ? (
        <Box flexDirection="column">
          <Text color="yellow">No instances found.</Text>
          <Text dimColor>Create one with: claude-multi add &lt;name&gt;</Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          <Text bold>Found {countDisplay} instance(s):</Text>
          <Box flexDirection="column" gap={0}>
            {instances.slice(0, visibleCount).map((instance, i) => (
              <InstanceCard key={instance.name} instance={instance} index={i} />
            ))}
          </Box>
        </Box>
      )}

      {showHint && (
        <Box marginTop={1}>
          <Text dimColor>ESC to go back</Text>
        </Box>
      )}
    </Box>
  );
};
