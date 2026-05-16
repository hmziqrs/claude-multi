import React, { useState } from "react";
import { Box, Text } from "ink";
import { Select, TextInput } from "@inkjs/ui";
import { Header } from "@/ink/components/Header";
import { StatusBar } from "@/ink/components/StatusBar";
import { InstanceSelectMenu } from "@/ink/components/InstanceSelectMenu";
import { useNavigation } from "@/ink/hooks/useNavigation";
import { useConfig } from "@/ink/hooks/useConfig";
import { useMessage } from "@/ink/hooks/useMessage";
import { useFadeIn, useStaggeredReveal } from "@/ink/hooks/useAnimations";
import type { McpServer } from "@/config";

type Step = "action" | "select" | "details" | "select-source" | "select-target" | "copying" | "add-name" | "add-config" | "remove-select" | "done";

interface McpSource {
  name: string;
  config: McpServer;
  source: "plugin" | "custom";
  pluginName?: string;
}

const McpSourceDetails: React.FC<{
  sources: McpSource[];
  action: string | null;
}> = ({ sources, action }) => {
  const visibleCount = useStaggeredReveal(sources.length, 80);
  const showStatus = useFadeIn(50);

  if (sources.length === 0) {
    return <Text color="yellow">⚠ No MCP configuration found</Text>;
  }

  return (
    <Box flexDirection="column" gap={0}>
      {action === "verify" && showStatus && (
        <StatusBar message={`${sources.length} MCP server(s) found`} type="success" />
      )}
      {sources.slice(0, visibleCount).map((src) => (
        <Box key={src.name} marginLeft={2} flexDirection="column">
          <Box gap={1}>
            <Text bold color="cyan">{src.name}</Text>
            {src.source === "plugin" ? (
              <Text dimColor>[{src.pluginName}]</Text>
            ) : (
              <Text dimColor>[custom]</Text>
            )}
            {action === "verify" && (
              src.config.type === "stdio" && !src.config.command ? (
                <Text color="yellow">⚠</Text>
              ) : (src.config.type === "http" || src.config.type === "sse") && !src.config.url ? (
                <Text color="yellow">⚠</Text>
              ) : (
                <Text color="green">✓</Text>
              )
            )}
          </Box>
          <Box marginLeft={2} flexDirection="column">
            <Box gap={1}>
              <Text dimColor>├─</Text>
              <Text dimColor bold>Type:</Text>
              <Text>{src.config.type}</Text>
            </Box>
            {src.config.command && (
              <Box gap={1}>
                <Text dimColor>├─</Text>
                <Text dimColor bold>Command:</Text>
                <Text>{src.config.command}{src.config.args?.length ? ` ${src.config.args.join(" ")}` : ""}</Text>
              </Box>
            )}
            {src.config.url && (
              <Box gap={1}>
                <Text dimColor>└─</Text>
                <Text dimColor bold>URL:</Text>
                <Text>{src.config.url}</Text>
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export const ManageMcp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { instances, listMcpServers, copyMcpServersBetweenInstances, getInstanceMcpServers, getMcpServersFromPlugins, listInstancePlugins, setCustomMcpServer, removeCustomMcpServer } = useConfig();
  const [step, setStep] = useState<Step>("action");
  const [action, setAction] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [sourceInstance, setSourceInstance] = useState<string | null>(null);
  const [mcpSources, setMcpSources] = useState<McpSource[]>([]);
  const { error, setError, success, setSuccess } = useMessage();
  const [customName, setCustomName] = useState("");
  const [customConfig, setCustomConfig] = useState("");

  useNavigation(() => {
    if (step === "details" || step === "select" || step === "remove-select" || step === "add-name" || step === "add-config") {
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
      <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
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

  const handleAddNameSubmit = (value: string) => {
    if (!value.trim()) {
      setError("Server name cannot be empty");
      return;
    }
    setCustomName(value.trim());
    setStep("add-config");
  };

  const handleAddConfigSubmit = async (value: string) => {
    if (!selectedInstance) return;
    try {
      const config = JSON.parse(value);
      const inst = instances.find(i => i.name === selectedInstance);
      if (!inst) return;
      await setCustomMcpServer(inst.configDir, customName, config);
      setSuccess(`Added custom MCP server '${customName}' to '${selectedInstance}'`);
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
      setStep("add-config");
    }
  };

  const handleRemoveSelect = async (serverName: string) => {
    if (!selectedInstance) return;
    try {
      const inst = instances.find(i => i.name === selectedInstance);
      if (!inst) return;
      await removeCustomMcpServer(inst.configDir, serverName);
      setSuccess(`Removed custom MCP server '${serverName}' from '${selectedInstance}'`);
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
      setStep("action");
    }
  };

  const buildMcpSources = async (instanceName: string): Promise<McpSource[]> => {
    const inst = instances.find(i => i.name === instanceName);
    if (!inst) return [];

    const { fromPlugins, fromSettings } = await getInstanceMcpServers(inst.configDir);

    // Get plugin names for MCP servers
    const pluginMcpNames = Object.keys(fromPlugins);
    const pluginDir = inst.configDir;
    // Build a reverse map: mcpServerName -> pluginName
    const mcpToPlugin: Record<string, string> = {};
    try {
      const plugins = listInstancePlugins(pluginDir);
      for (const p of plugins) {
        if (p.mcpServerNames) {
          for (const serverName of p.mcpServerNames) {
            mcpToPlugin[serverName] = p.name;
          }
        }
      }
    } catch {}

    const sources: McpSource[] = [];

    // Plugin-derived servers
    for (const [name, config] of Object.entries(fromPlugins)) {
      sources.push({
        name,
        config,
        source: "plugin",
        pluginName: mcpToPlugin[name] ?? "unknown",
      });
    }

    // Custom servers (in settings but not from plugins)
    for (const [name, config] of Object.entries(fromSettings)) {
      if (!fromPlugins[name]) {
        sources.push({
          name,
          config,
          source: "custom",
        });
      }
    }

    return sources.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleInstanceSelect = async (value: string) => {
    setSelectedInstance(value);
    try {
      if (action === "add") {
        setStep("add-name");
        return;
      }
      if (action === "remove-custom") {
        const sources = await buildMcpSources(value);
        const customs = sources.filter(s => s.source === "custom");
        if (customs.length === 0) {
          setError("No custom MCP servers found in this instance");
          setStep("action");
          return;
        }
        setMcpSources(customs);
        setStep("remove-select");
        return;
      }
      const sources = await buildMcpSources(value);
      setMcpSources(sources);
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
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="⚙️ Manage MCP Servers" />

      {error && <StatusBar message={error} type="error" />}

      {step === "action" && (
        <Box flexDirection="column" gap={1}>
          <Text>What would you like to do?</Text>
          <Select
            options={[
              { label: "📋 List MCP servers with sources", value: "list" },
              { label: "🔍 Verify MCP configuration", value: "verify" },
              { label: "📋 Copy between instances", value: "copy" },
              { label: "➕ Add custom MCP server", value: "add" },
              { label: "➖ Remove custom MCP server", value: "remove-custom" },
              { label: "Cancel", value: "cancel" },
            ]}
            visibleOptionCount={6}
            onChange={handleAction}
          />
        </Box>
      )}

      {step === "select" && (
        <InstanceSelectMenu instances={instances} onSelect={handleInstanceSelect} />
      )}

      {step === "details" && (
        <McpSourceDetails sources={mcpSources} action={action} />
      )}

      {step === "select-source" && (
        <InstanceSelectMenu instances={instances} label="Source instance:" onSelect={handleSourceSelect} />
      )}

      {step === "select-target" && sourceInstance && (
        <Box flexDirection="column" gap={1}>
          <Text>Target instance:</Text>
          <Select
            options={instances
              .filter((i) => i.name !== sourceInstance)
              .map((i) => ({ label: i.name, value: i.name }))}
            visibleOptionCount={instances.length - 1}
            onChange={handleTargetSelect}
          />
        </Box>
      )}

      {step === "add-name" && (
        <Box flexDirection="column" gap={1}>
          <Text>Enter MCP server name for '{selectedInstance}':</Text>
          <TextInput placeholder="my-server" onSubmit={handleAddNameSubmit} />
        </Box>
      )}

      {step === "add-config" && (
        <Box flexDirection="column" gap={1}>
          <Text>Enter JSON config for '{customName}':</Text>
          <Text dimColor>Example: {"{ \"type\": \"stdio\", \"command\": \"npx\", \"args\": [\"-y\", \"my-server\"] }"}</Text>
          <TextInput
            placeholder='{"type":"stdio","command":"npx","args":["-y","pkg"]}'
            onSubmit={handleAddConfigSubmit}
          />
        </Box>
      )}

      {step === "remove-select" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select a custom MCP server to remove:</Text>
          <Select
            options={mcpSources.map(s => ({ label: s.name, value: s.name }))}
            visibleOptionCount={Math.min(mcpSources.length, 10)}
            onChange={handleRemoveSelect}
          />
        </Box>
      )}

      {step === "copying" && <Text dimColor>Copying...</Text>}

      {step === "done" && success && <StatusBar message={success} type="success" />}

      <Box marginTop={1}>
        <Text dimColor>ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
