import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Select, Spinner } from "@inkjs/ui";
import { Header } from "@/ink/components/Header";
import { StatusBar } from "@/ink/components/StatusBar";
import { Footer } from "@/ink/components/Footer";
import { useFadeIn } from "@/ink/hooks/useAnimations";
import { useMessage } from "@/ink/hooks/useMessage";
import {
  checkForClaudeMultiUpdates,
  upgradeClaudeMulti,
  checkForUpdates,
  updateClaudeCode,
  type ClaudeMultiUpdateInfo,
  type VersionInfo,
} from "@/version";

type Step = "loading" | "result" | "updating" | "check-failed";

function VersionCard({
  label,
  current,
  latest,
  hasUpdate,
  failed,
}: {
  label: string;
  current: string | null;
  latest: string;
  hasUpdate: boolean;
  failed?: boolean;
}) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text bold>{label}</Text>
      </Box>
      <Box marginLeft={2}>
        <Text dimColor>Current: </Text>
        <Text color={failed ? "red" : hasUpdate ? "yellow" : "green"}>
          {current || (failed ? "check failed" : "not installed")}
        </Text>
      </Box>
      <Box marginLeft={2}>
        <Text dimColor>Latest:  </Text>
        <Text bold>{latest || (failed ? "unreachable" : "unknown")}</Text>
      </Box>
      {failed && (
        <Box marginLeft={2}>
          <Text color="red">✗ Could not reach npm registry</Text>
        </Box>
      )}
      {!failed && hasUpdate && (
        <Box marginLeft={2}>
          <Text color="yellow">▲ Update available</Text>
        </Box>
      )}
      {!failed && !hasUpdate && current && (
        <Box marginLeft={2}>
          <Text color="green">✓ Up to date</Text>
        </Box>
      )}
    </Box>
  );
}

export const UpdateScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { exit } = useApp();
  const fadeIn = useFadeIn();
  const { error, success, setError, setSuccess, clear } = useMessage();

  const [step, setStep] = useState<Step>("loading");
  const [multiInfo, setMultiInfo] = useState<ClaudeMultiUpdateInfo | null>(null);
  const [claudeInfo, setClaudeInfo] = useState<VersionInfo | null>(null);
  const [updatingTarget, setUpdatingTarget] = useState<string | null>(null);

  // Suppress ESC during loading/updating to prevent corrupted installs
  useInput((input, key) => {
    if (key.escape && step === "result") {
      onBack();
    } else if (input === "q") {
      exit();
    }
  });

  const fetchVersions = useCallback(() => {
    Promise.all([checkForClaudeMultiUpdates(), checkForUpdates()])
      .then(([multi, claude]) => {
        setMultiInfo(multi);
        setClaudeInfo(claude);
        clear();
        if (!multi.current && !claude.current && !multi.latest && !claude.latest) {
          setStep("check-failed");
          setError("Could not reach npm registry");
        } else {
          setStep("result");
        }
      })
      .catch(() => {
        setError("Failed to check for updates");
        setStep("check-failed");
      });
  }, [clear, setError]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleUpdate = async (target: "multi" | "claude") => {
    setUpdatingTarget(target);
    setStep("updating");
    try {
      if (target === "multi") {
        await upgradeClaudeMulti();
        const updated = await checkForClaudeMultiUpdates();
        setMultiInfo(updated);
        setSuccess(updated.latest
          ? `claude-multi updated to v${updated.latest}`
          : "claude-multi updated successfully");
      } else {
        await updateClaudeCode();
        const updated = await checkForUpdates();
        setClaudeInfo(updated);
        setSuccess(updated.latest
          ? `@anthropic-ai/claude-code updated to v${updated.latest}`
          : "@anthropic-ai/claude-code updated successfully");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
    setUpdatingTarget(null);
    setStep("result");
  };

  if (!fadeIn) return null;

  if (step === "loading" || step === "check-failed") {
    const isFailed = step === "check-failed";
    return (
      <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
        <Header title="📦 Updates" />
        {isFailed ? (
          <>
            {multiInfo && (
              <VersionCard
                label="claude-multi"
                current={multiInfo.current || null}
                latest={multiInfo.latest}
                hasUpdate={multiInfo.updateAvailable}
                failed={!multiInfo.current && !multiInfo.latest}
              />
            )}
            {claudeInfo && (
              <VersionCard
                label="@anthropic-ai/claude-code"
                current={claudeInfo.current}
                latest={claudeInfo.latest}
                hasUpdate={claudeInfo.updateAvailable}
                failed={!claudeInfo.current && !claudeInfo.latest}
              />
            )}
            {error && <Box marginTop={1}><StatusBar message={error} type="error" /></Box>}
            <Box marginTop={1}>
              <Select
                options={[
                  { label: "🔄 Retry", value: "recheck" },
                  { label: "↩️  Back to menu", value: "back" },
                ]}
                onChange={(value: string) => {
                  if (value === "back") onBack();
                  else if (value === "recheck") {
                    setStep("loading");
                    setMultiInfo(null);
                    setClaudeInfo(null);
                    fetchVersions();
                  }
                }}
              />
            </Box>
          </>
        ) : (
          <Box marginTop={1}>
            <Spinner label="Checking for updates..." />
          </Box>
        )}
      </Box>
    );
  }

  if (step === "updating") {
    return (
      <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
        <Header title="📦 Updates" />
        <Box marginTop={1}>
          <Spinner label={`Updating ${updatingTarget === "multi" ? "claude-multi" : "@anthropic-ai/claude-code"}...`} />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Do not press ESC — update in progress</Text>
        </Box>
      </Box>
    );
  }

  const multiUpdate = multiInfo?.updateAvailable ?? false;
  const claudeUpdate = claudeInfo?.updateAvailable ?? false;

  const actionOptions = [];
  if (multiUpdate) {
    actionOptions.push({ label: "⬆️  Update claude-multi", value: "multi" });
  }
  if (claudeUpdate) {
    actionOptions.push({ label: "⬆️  Update @anthropic-ai/claude-code", value: "claude" });
  }
  actionOptions.push({ label: "🔄 Re-check versions", value: "recheck" });
  actionOptions.push({ label: "↩️  Back to menu", value: "back" });

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="📦 Updates" />

      <VersionCard
        label="claude-multi"
        current={multiInfo?.current ?? null}
        latest={multiInfo?.latest ?? ""}
        hasUpdate={multiUpdate}
      />

      <VersionCard
        label="@anthropic-ai/claude-code"
        current={claudeInfo?.current ?? null}
        latest={claudeInfo?.latest ?? ""}
        hasUpdate={claudeUpdate}
      />

      {error && <Box marginTop={1}><StatusBar message={error} type="error" /></Box>}
      {success && <Box marginTop={1}><StatusBar message={success} type="success" /></Box>}

      <Box marginTop={1}>
        <Select
          options={actionOptions}
          onChange={(value: string) => {
            if (value === "back") {
              onBack();
            } else if (value === "recheck") {
              setStep("loading");
              setMultiInfo(null);
              setClaudeInfo(null);
              fetchVersions();
            } else if (value === "multi") {
              handleUpdate("multi");
            } else if (value === "claude") {
              handleUpdate("claude");
            }
          }}
        />
      </Box>

      <Footer />
    </Box>
  );
};
