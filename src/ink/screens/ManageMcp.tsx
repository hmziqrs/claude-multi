import React, { useState } from "react";
import { Box, Text } from "ink";
import { Select } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { StatusBar } from "../components/StatusBar.js";
import { useNavigation } from "../hooks/useNavigation.js";
import { useConfig } from "../hooks/useConfig.js";
import type { McpServer } from "../../config.js";

type Step = "action" | "select" | "details" | "select-source" | "select-target" | "copying" | "done";

export const ManageMcp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { instances, listMcpServers, copyMcpServersBetweenInstances } = useConfig();
  const [step, setStep] = useState<Step>("action");
  const [action, setAction] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [sourceInstance, setSourceInstance] = useState<string | null>(null);
  const [mcpServers, setMcpServers] = useState<Record<string, McpServer> | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useNavigation(() => {
    if (step === "details" || step === "select") {
      setStep("action");
    } else if (step === "select-target") {
      setStep("select-source");
    } else if (step === "done") {
      onBack();
    } else {
      onBack();
    }
  });

  if (instances.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Header title="⚙️ Manage MCP Servers" />
        <Text color="yellow">No instances found.</Text>
        <Box marginTop={1}><Text dimColor>ESC to go back</Text></Box>
      </Box>
    );
  }

  const handleAction = (value: string) => {
    if (value === "cancel") { onBack(); return; }
    setAction(value);
    if (value === "copy") {
      if (instances.length < 2) {
        setError("Need at least 2 instances to copy");
        return;
      }
      setStep("select-source");
    } else {
      setStep("select");
    }
  };

  const handleInstanceSelect = async (value: string) => {
    setSelectedInstance(value);
    try {
      const servers = await listMcpServers(value);
      setMcpServers(servers);
      setStep("details");
    } catch (err) {
      setError((err as Error).message);
      setStep("action");
    }
  };

  const handleSourceSelect = (value: string) => {
    setSourceInstance(value);
    setStep("select-target");
  };

  const handleTargetSelect = async (value: string) => {
    if (!sourceInstance) return;
    setStep("copying");
    try {
      await copyMcpServersBetweenInstances(sourceInstance, value);
      setSuccess(`Copied MCP servers from '${sourceInstance}' to '${value}'`);
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
      setStep("action");
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="⚙️ Manage MCP Servers" />

      {error && <StatusBar message={error} type="error" />}

      {step === "action" && (
        <Box flexDirection="column" gap={1}>
          <Text>What would you like to do?</Text>
          <Select
            options={[
              { label: "📋 List MCP servers", value: "list" },
              { label: "🔍 Verify MCP configuration", value: "verify" },
              { label: "📋 Copy between instances", value: "copy" },
              { label: "Cancel", value: "cancel" },
            ]}
            onChange={handleAction}
          />
        </Box>
      )}

      {step === "select" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select an instance:</Text>
          <Select
            options={instances.map((i) => ({ label: i.name, value: i.name }))}
            onChange={handleInstanceSelect}
          />
        </Box>
      )}

      {step === "details" && (
        <Box flexDirection="column" gap={1}>
          {!mcpServers || Object.keys(mcpServers).length === 0 ? (
            <Text color="yellow">⚠ No MCP configuration found</Text>
          ) : (
            <>
              {action === "verify" && (
                <StatusBar message={`${Object.keys(mcpServers).length} MCP server(s) found`} type="success" />
              )}
              {Object.entries(mcpServers).map(([name, config]) => (
                <Box key={name} marginLeft={2} flexDirection="column">
                  <Box gap={1}>
                    <Text bold color="cyan">{name}</Text>
                    {action === "verify" && (
                      config.type === "stdio" && !config.command ? (
                        <Text color="yellow">⚠</Text>
                      ) : (config.type === "http" || config.type === "sse") && !config.url ? (
                        <Text color="yellow">⚠</Text>
                      ) : (
                        <Text color="green">✓</Text>
                      )
                    )}
                  </Box>
                  <Box marginLeft={2} flexDirection="column">
                    <Box gap={2}>
                      <Text dimColor bold>Type:</Text>
                      <Text>{config.type}</Text>
                    </Box>
                    {config.command && (
                      <Box gap={2}>
                        <Text dimColor bold>Command:</Text>
                        <Text>{config.command}{config.args?.length ? ` ${config.args.join(" ")}` : ""}</Text>
                      </Box>
                    )}
                    {config.url && (
                      <Box gap={2}>
                        <Text dimColor bold>URL:</Text>
                        <Text>{config.url}</Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </>
          )}
        </Box>
      )}

      {step === "select-source" && (
        <Box flexDirection="column" gap={1}>
          <Text>Source instance:</Text>
          <Select
            options={instances.map((i) => ({ label: i.name, value: i.name }))}
            onChange={handleSourceSelect}
          />
        </Box>
      )}

      {step === "select-target" && sourceInstance && (
        <Box flexDirection="column" gap={1}>
          <Text>Target instance:</Text>
          <Select
            options={instances
              .filter((i) => i.name !== sourceInstance)
              .map((i) => ({ label: i.name, value: i.name }))}
            onChange={handleTargetSelect}
          />
        </Box>
      )}

      {step === "copying" && <Text dimColor>Copying...</Text>}

      {step === "done" && <StatusBar message={success} type="success" />}

      <Box marginTop={1}>
        <Text dimColor>ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
