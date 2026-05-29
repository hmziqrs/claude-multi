import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { Select } from "@inkjs/ui";
import { Header } from "@/ink/components/Header";
import { StatusBar } from "@/ink/components/StatusBar";
import { useNavigation } from "@/ink/hooks/useNavigation";
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

const SEVERITY_ICONS: Record<string, string> = {
  error: "❌",
  warning: "⚠",
  info: "ℹ️",
};

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

  useNavigation(() => {
    if (step === "detail") {
      setStep("list");
      setSelectedIssue(null);
    } else {
      onBack();
    }
  });

  useInput((input) => {
    if (step === "list") {
      if (input === "D") {
        onDismissAll();
      } else if (input === "r") {
        onRetry();
      } else if (input === "f") {
        onFix();
      }
    } else if (step === "detail" && selectedIssue) {
      if (input === "d") {
        onDismiss(selectedIssue.id);
        setSelectedIssue(null);
        setStep("list");
      }
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

  const hasVersionIssues = issues.some(i => i.category === "version");

  const handleIssueSelect = (value: string) => {
    const issue = issues.find(i => i.id === value);
    if (issue) {
      setSelectedIssue(issue);
      setStep("detail");
    }
  };

  const issueOptions = issues.map((issue) => ({
    label: `${SEVERITY_ICONS[issue.severity] ?? "•"} ${issue.title}`,
    value: issue.id,
  }));

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="⚠ System Health" />

      {step === "list" && (
        <Box flexDirection="column" gap={1}>
          <Text bold>{issues.length} issue(s) found — select one to view:</Text>
          <Select
            options={issueOptions}
            visibleOptionCount={issueOptions.length}
            onChange={handleIssueSelect}
          />
          <Box marginTop={1} flexDirection="column">
            {hasVersionIssues && (
              <Box marginBottom={1}>
                <Text color="cyan" bold>f</Text>
                <Text color="cyan"> fix wrappers </Text>
                <Text dimColor>│</Text>
              </Box>
            )}
            <Text dimColor>D dismiss all │ r retry │ ESC back</Text>
          </Box>
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
            {selectedIssue.detail && (
              <Box gap={1}>
                <Text dimColor>├─</Text>
                <Text dimColor bold>Info:</Text>
                <Text dimColor>{selectedIssue.detail}</Text>
              </Box>
            )}
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
