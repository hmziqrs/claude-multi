import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { Header } from "@/ink/components/Header";
import { StatusBar } from "@/ink/components/StatusBar";
import { IssueCard } from "@/ink/components/IssueCard";
import { useNavigation } from "@/ink/hooks/useNavigation";
import { useFadeIn } from "@/ink/hooks/useAnimations";
import type { HealthIssue } from "@/health";

interface HealthScreenProps {
  issues: HealthIssue[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onRetry: () => void;
  onFix: () => void;
  onBack: () => void;
}

type Step = "list" | "detail";

export const HealthScreen: React.FC<HealthScreenProps> = ({
  issues,
  onDismiss,
  onDismissAll,
  onRetry,
  onFix,
  onBack,
}) => {
  const [step, setStep] = useState<Step>("list");
  const [selectedIssue, setSelectedIssue] = useState<HealthIssue | null>(null);
  const showActions = useFadeIn(100);

  useNavigation(() => {
    if (step === "detail") {
      setStep("list");
      setSelectedIssue(null);
    } else {
      onBack();
    }
  });

  useInput((input) => {
    if (step !== "list") return;
    if (input === "d" && selectedIssue) {
      onDismiss(selectedIssue.id);
      setSelectedIssue(null);
    } else if (input === "D") {
      onDismissAll();
    } else if (input === "r") {
      onRetry();
    } else if (input === "f") { // [SAFE PARK] fix wrappers
      onFix();
    } else if (input === " " && selectedIssue) {
      setStep("detail");
    }
  });

  if (issues.length === 0) {
    return (
      <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
        <Header title="💚 System Health" />
        <StatusBar message="All systems healthy!" type="success" />
        <Box marginTop={1}>
          <Text dimColor>ESC to go back</Text>
        </Box>
      </Box>
    );
  }
  const hasVersionIssues = issues.some(i => i.category === "version"); // [SAFE PARK]

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="⚠ System Health" />

      {step === "list" && (
        <Box flexDirection="column" gap={1}>
          <Text bold>{issues.length} issue(s) found:</Text>
          {issues.map((issue, i) => (
            <IssueCard key={issue.id} issue={issue} index={i} />
          ))}
          {showActions && (
            <Box marginTop={1} flexDirection="column">
              {hasVersionIssues && (
                <Box marginBottom={1}>
                  <Text color="cyan" bold>f</Text>
                  <Text color="cyan"> fix wrappers </Text>
                  <Text dimColor>│</Text>
                </Box>
              )}
              <Text dimColor>Space view detail │ d dismiss │ D dismiss all │ r retry │ ESC back</Text>
            </Box>
          )}
        </Box>
      )}

      {step === "detail" && selectedIssue && (
        <Box flexDirection="column" gap={1}>
          <Text bold>{selectedIssue.title}</Text>
          <Box marginLeft={2} flexDirection="column">
            <Box gap={1}>
              <Text dimColor>├─</Text>
              <Text dimColor bold>Severity:</Text>
              <Text color={selectedIssue.severity === "error" ? "red" : "yellow"}>
                {selectedIssue.severity}
              </Text>
            </Box>
            {selectedIssue.instanceName && (
              <Box gap={1}>
                <Text dimColor>├─</Text>
                <Text dimColor bold>Instance:</Text>
                <Text>{selectedIssue.instanceName}</Text>
              </Box>
            )}
            <Box gap={1}>
              <Text dimColor>├─</Text>
              <Text dimColor bold>Detail:</Text>
              <Text>{selectedIssue.message}</Text>
            </Box>
            {selectedIssue.resolutionHint && (
              <Box gap={1}>
                <Text dimColor>└─</Text>
                <Text dimColor bold>Fix:</Text>
                <Text dimColor>{selectedIssue.resolutionHint}</Text>
              </Box>
            )}
          </Box>
          <Box marginTop={1}>
            <Text dimColor>d dismiss │ ESC back</Text>
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC to go back</Text>
      </Box>
    </Box>
  );
};
