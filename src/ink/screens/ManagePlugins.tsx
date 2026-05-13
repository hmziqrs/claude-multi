import React, { useState } from "react";
import { Box, Text } from "ink";
import { Select, MultiSelect } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { StatusBar } from "../components/StatusBar.js";
import { useNavigation } from "../hooks/useNavigation.js";
import { useConfig } from "../hooks/useConfig.js";

type Step = "action" | "select-instance" | "select-plugins" | "done";

export const ManagePlugins: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { instances, getEnabledPlugins, setEnabledPlugins, enablePlugin, disablePlugin, listAvailablePlugins, reload } = useConfig();
  const [step, setStep] = useState<Step>("action");
  const [action, setAction] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [plugins, setPlugins] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useNavigation(() => {
    if (step === "select-instance" || step === "select-plugins") {
      setStep("action");
    } else if (step === "done") {
      onBack();
    } else {
      onBack();
    }
  });

  if (instances.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Header title="🔌 Manage Plugins" />
        <Text color="yellow">No instances found.</Text>
        <Box marginTop={1}><Text dimColor>ESC to go back</Text></Box>
      </Box>
    );
  }

  const handleAction = (value: string) => {
    if (value === "cancel") { onBack(); return; }
    setAction(value);
    setStep("select-instance");
  };

  const handleInstanceSelect = async (value: string) => {
    setSelectedInstance(value);
    const instance = instances.find((i) => i.name === value);
    if (!instance) return;

    if (action === "copy") {
      try {
        const defaultPlugins = await listAvailablePlugins();
        if (defaultPlugins) {
          await setEnabledPlugins(instance.configDir, defaultPlugins);
          setSuccess(`Copied plugins to '${value}'`);
          setStep("done");
        } else {
          setError("No plugins found in default Claude settings");
          setStep("action");
        }
      } catch (err) {
        setError((err as Error).message);
        setStep("action");
      }
      return;
    }

    const p = await getEnabledPlugins(instance.configDir);
    if (!p) {
      setError("No plugins configured for this instance");
      setStep("action");
      return;
    }
    setPlugins(p);
    setStep("select-plugins");
  };

  const handlePluginToggle = async (selectedPlugins: string[]) => {
    if (!selectedInstance) return;
    const instance = instances.find((i) => i.name === selectedInstance);
    if (!instance) return;

    try {
      for (const pluginId of selectedPlugins) {
        if (action === "enable") await enablePlugin(instance.configDir, pluginId);
        else await disablePlugin(instance.configDir, pluginId);
      }
      setSuccess(`${action === "enable" ? "Enabled" : "Disabled"} ${selectedPlugins.length} plugin(s) for '${selectedInstance}'`);
      await reload();
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
      setStep("action");
    }
  };

  const getFilteredPlugins = () => {
    const filter = action === "enable" ? ([, v]: [string, boolean]) => !v : ([, v]: [string, boolean]) => v;
    return Object.entries(plugins).filter(filter).map(([id]) => ({ label: id, value: id }));
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="🔌 Manage Plugins" />

      {error && <StatusBar message={error} type="error" />}

      {step === "action" && (
        <Box flexDirection="column" gap={1}>
          <Text>What would you like to do?</Text>
          <Select
            options={[
              { label: "✅ Enable plugins", value: "enable" },
              { label: "❌ Disable plugins", value: "disable" },
              { label: "📋 Copy from default Claude", value: "copy" },
              { label: "Cancel", value: "cancel" },
            ]}
            onChange={handleAction}
          />
        </Box>
      )}

      {step === "select-instance" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select an instance:</Text>
          <Select
            options={instances.map((i) => ({ label: i.name, value: i.name }))}
            onChange={handleInstanceSelect}
          />
        </Box>
      )}

      {step === "select-plugins" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select plugins to {action === "enable" ? "enable" : "disable"}:</Text>
          <MultiSelect
            options={getFilteredPlugins()}
            onSubmit={handlePluginToggle}
          />
        </Box>
      )}

      {step === "done" && (
        <StatusBar message={success} type="success" />
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
