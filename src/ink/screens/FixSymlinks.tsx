import React, { useState } from "react";
import { Box, Text } from "ink";
import { MultiSelect } from "@inkjs/ui";
import { Header } from "@/ink/components/Header";
import { StatusBar } from "@/ink/components/StatusBar";
import { useNavigation } from "@/ink/hooks/useNavigation";
import { useConfig } from "@/ink/hooks/useConfig";
import { useMessage } from "@/ink/hooks/useMessage";
import { useStaggeredReveal, useFadeIn } from "@/ink/hooks/useAnimations";

type Step = "select" | "fixing" | "done";

const SymlinkResults: React.FC<{
  results: { name: string; broken: string[]; all: string[]; fixed: boolean }[];
}> = ({ results }) => {
  const visibleCount = useStaggeredReveal(results.length, 80);
  const showDone = useFadeIn(results.length * 80 + 100);

  return (
    <Box flexDirection="column" gap={0}>
      {results.slice(0, visibleCount).map((r) => (
        <Box key={r.name} marginLeft={2} flexDirection="column">
          <Box gap={1}>
            <Text bold>{r.name}</Text>
            {r.broken.length > 0 ? (
              r.fixed
                ? <Text color="green">✅ Fixed: {r.broken.join(", ")}</Text>
                : <Text color="red">❌ Failed: {r.broken.join(", ")}</Text>
            ) : r.all.length > 0 ? (
              <Text color="green">✅ All OK: {r.all.join(", ")}</Text>
            ) : (
              <Text dimColor>no symlinks (manual)</Text>
            )}
          </Box>
        </Box>
      ))}
      {showDone && <Box marginTop={1}><Text bold>✨ Done!</Text></Box>}
    </Box>
  );
};

export const FixSymlinks: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { instances, detectBrokenSymlinks, syncPluginsAndSkills } = useConfig();
  const [step, setStep] = useState<Step>("select");
  const [results, setResults] = useState<
    { name: string; broken: string[]; all: string[]; fixed: boolean }[]
  >([]);
  const { error, setError } = useMessage();

  useNavigation(() => {
    if (step === "done") onBack();
    else onBack();
  });

  if (instances.length === 0) {
    return (
      <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
        <Header title="🔄 Re-sync Symlinks" />
        <Text color="yellow">No instances found.</Text>
        <Box marginTop={1}><Text dimColor>ESC to go back</Text></Box>
      </Box>
    );
  }

  const instanceOptions = instances.map((i) => ({
    label: `${i.name} ${i.autoSync !== false ? "(auto-sync)" : "(manual)"}`,
    value: i.name,
  }));

  const handleSelect = async (selectedNames: string[]) => {
    setStep("fixing");
    setError("");

    const fixResults: typeof results = [];
    for (const name of selectedNames) {
      const instance = instances.find((i) => i.name === name);
      if (!instance) continue;
      const diagnosis = detectBrokenSymlinks(instance.configDir);
      const hasBroken = diagnosis.broken.length > 0;

      if (hasBroken && instance.autoSync !== false) {
        try {
          await syncPluginsAndSkills(instance.configDir);
          fixResults.push({ name, broken: diagnosis.broken, all: diagnosis.all, fixed: true });
        } catch {
          fixResults.push({ name, broken: diagnosis.broken, all: diagnosis.all, fixed: false });
        }
      } else {
        fixResults.push({ name, broken: diagnosis.broken, all: diagnosis.all, fixed: !hasBroken });
      }
    }
    setResults(fixResults);
    setStep("done");
  };

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🔄 Re-sync Symlinks" />

      {error && <StatusBar message={error} type="error" />}

      {step === "select" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select instances to fix:</Text>
          <MultiSelect
            options={instanceOptions}
            visibleOptionCount={instanceOptions.length}
            onSubmit={handleSelect}
          />
        </Box>
      )}

      {step === "fixing" && <Text dimColor>Fixing symlinks...</Text>}

      {step === "done" && (
        <SymlinkResults results={results} />
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
