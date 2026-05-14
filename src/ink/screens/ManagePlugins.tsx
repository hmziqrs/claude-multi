import React, { useState, useMemo } from "react";
import { Box, Text } from "ink";
import { Select, MultiSelect, ConfirmInput } from "@inkjs/ui";
import { Header } from "../components/Header.js";
import { StatusBar } from "../components/StatusBar.js";
import { useNavigation } from "../hooks/useNavigation.js";
import { useConfig, type PluginInfo } from "../hooks/useConfig.js";
import { useFadeIn, useStaggeredReveal } from "../hooks/useAnimations.js";

type Step = "action" | "select-instance" | "select-plugins" | "symlink-warning" | "plugin-list" | "done";

const PluginSuccess: React.FC<{ message: string }> = ({ message }) => {
  const visible = useFadeIn(100);
  if (!visible) return null;
  return <StatusBar message={message} type="success" />;
};

const PluginRow: React.FC<{ plugin: PluginInfo; index: number }> = ({ plugin, index }) => {
  const visible = useFadeIn(index * 40 + 50);
  if (!visible) return null;
  return (
    <Box gap={1} marginLeft={2}>
      <Text color={plugin.enabled ? "green" : "red"}>
        {plugin.enabled ? "✓" : "✗"}
      </Text>
      <Text bold={plugin.enabled}>{plugin.name}</Text>
      {plugin.hasMcp && <Text color="cyan" dimColor>(MCP)</Text>}
      {plugin.category === "external" && <Text dimColor>[ext]</Text>}
    </Box>
  );
};

export const ManagePlugins: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const {
    instances, reload,
    listDefaultPlugins, listInstancePlugins,
    copySelectedPlugins, removeSinglePlugin,
    enablePlugin, disablePlugin, isPluginsSymlinked,
  } = useConfig();

  const [step, setStep] = useState<Step>("action");
  const [action, setAction] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [instancePlugins, setInstancePlugins] = useState<PluginInfo[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useNavigation(() => {
    if (step === "select-instance" || step === "select-plugins" || step === "plugin-list" || step === "symlink-warning") {
      setStep("action");
    } else if (step === "done") {
      onBack();
    } else {
      onBack();
    }
  });

  if (instances.length === 0) {
    return (
      <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
        <Header title="🔌 Manage Plugins" />
        <Text color="yellow">No instances found.</Text>
        <Box marginTop={1}><Text dimColor>ESC to go back</Text></Box>
      </Box>
    );
  }

  const instanceOptions = instances.map((i) => ({ label: i.name, value: i.name }));

  const getInstance = (name: string) => instances.find(i => i.name === name);

  const handleAction = (value: string) => {
    if (value === "cancel") { onBack(); return; }
    setAction(value);
    setStep("select-instance");
  };

  const handleInstanceSelect = async (value: string) => {
    setSelectedInstance(value);
    const inst = getInstance(value);
    if (!inst) return;

    // Check symlink state for operations that modify plugins
    if (["install", "remove", "enable", "disable"].includes(action ?? "")) {
      if (isPluginsSymlinked(inst.configDir)) {
        setStep("symlink-warning");
        return;
      }
    }

    await loadInstancePluginData(value, inst.configDir);
  };

  const loadInstancePluginData = async (instName: string, configDir: string) => {
    try {
      if (action === "install") {
        // Show default plugins for selection
        const defaults = listDefaultPlugins();
        const installed = listInstancePlugins(configDir);
        const installedIds = new Set(installed.map(p => p.id));
        const available = defaults.filter(p => !installedIds.has(p.id));
        setInstancePlugins(available);
        setStep("select-plugins");
      } else if (action === "remove" || action === "enable" || action === "disable") {
        const plugins = listInstancePlugins(configDir);
        setInstancePlugins(plugins);
        setStep("select-plugins");
      } else if (action === "list") {
        const plugins = listInstancePlugins(configDir);
        setInstancePlugins(plugins);
        setStep("plugin-list");
      }
    } catch (err) {
      setError((err as Error).message);
      setStep("action");
    }
  };

  const handlePluginSubmit = async (selectedIds: string[]) => {
    if (!selectedInstance) return;
    const inst = getInstance(selectedInstance);
    if (!inst) return;

    if (selectedIds.length === 0) {
      setError("Select at least one plugin.");
      setStep("action");
      return;
    }

    try {
      if (action === "install") {
        const defaults = listDefaultPlugins();
        const selections = selectedIds.map(id => {
          const p = defaults.find(dp => dp.id === id);
          return { id, category: p?.category ?? "external" as const };
        });
        if (selections.length > 0) {
          await copySelectedPlugins(inst.configDir, selections);
        }
        setSuccess(`Installed ${selections.length} plugin(s) to '${selectedInstance}'`);
      } else if (action === "remove") {
        for (const id of selectedIds) {
          const p = instancePlugins.find(ip => ip.id === id);
          await removeSinglePlugin(inst.configDir, id, p?.category ?? "external");
        }
        setSuccess(`Removed ${selectedIds.length} plugin(s) from '${selectedInstance}'`);
      } else if (action === "enable") {
        for (const id of selectedIds) {
          await enablePlugin(inst.configDir, `${id}@claude-plugins-official`);
        }
        setSuccess(`Enabled ${selectedIds.length} plugin(s) for '${selectedInstance}'`);
      } else if (action === "disable") {
        for (const id of selectedIds) {
          await disablePlugin(inst.configDir, `${id}@claude-plugins-official`);
        }
        setSuccess(`Disabled ${selectedIds.length} plugin(s) for '${selectedInstance}'`);
      }
      await reload();
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
      setStep("action");
    }
  };

  const getFilteredPluginOptions = () => {
    if (action === "install") {
      return instancePlugins.map(p => ({
        label: `${p.name}${p.hasMcp ? " (MCP)" : ""}${p.category === "external" ? " [ext]" : ""}`,
        value: p.id,
      }));
    } else if (action === "remove") {
      return instancePlugins.map(p => ({
        label: `${p.name}${p.hasMcp ? " (MCP)" : ""}${p.category === "external" ? " [ext]" : ""}`,
        value: p.id,
      }));
    } else if (action === "enable") {
      return instancePlugins.filter(p => !p.enabled).map(p => ({
        label: `${p.name}${p.hasMcp ? " (MCP)" : ""}`,
        value: p.id,
      }));
    } else if (action === "disable") {
      return instancePlugins.filter(p => p.enabled).map(p => ({
        label: `${p.name}${p.hasMcp ? " (MCP)" : ""}`,
        value: p.id,
      }));
    }
    return [];
  };

  const filteredOptions = getFilteredPluginOptions();

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🔌 Manage Plugins" />

      {error && <StatusBar message={error} type="error" />}

      {step === "action" && (
        <Box flexDirection="column" gap={1}>
          <Text>What would you like to do?</Text>
          <Select
            options={[
              { label: "📥 Install plugins from default", value: "install" },
              { label: "🗑️  Remove installed plugins", value: "remove" },
              { label: "✅ Enable plugins", value: "enable" },
              { label: "❌ Disable plugins", value: "disable" },
              { label: "📋 List installed plugins", value: "list" },
              { label: "Cancel", value: "cancel" },
            ]}
            visibleOptionCount={6}
            onChange={handleAction}
          />
        </Box>
      )}

      {step === "select-instance" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select an instance:</Text>
          <Select
            options={instanceOptions}
            visibleOptionCount={instanceOptions.length}
            onChange={handleInstanceSelect}
          />
        </Box>
      )}

      {step === "symlink-warning" && (
        <Box flexDirection="column" gap={1}>
          <StatusBar
            message={`Instance '${selectedInstance}' has auto-sync enabled (symlinked plugins).`}
            type="error"
          />
          <Text dimColor>Disable auto-sync first to manage plugins individually.</Text>
          <Text dimColor>Use "🔄 Toggle auto-sync" from the main menu.</Text>
          <Box marginTop={1}>
            <ConfirmInput
              onConfirm={() => setStep("action")}
              onCancel={() => setStep("action")}
            />
          </Box>
        </Box>
      )}

      {step === "select-plugins" && (
        <Box flexDirection="column" gap={1}>
          {filteredOptions.length === 0 ? (
            <Text dimColor>
              {action === "install" ? "All default plugins already installed." :
               action === "enable" ? "All installed plugins are already enabled." :
               action === "disable" ? "All installed plugins are already disabled." :
               action === "remove" ? "No plugins installed to remove." :
               "No plugins found."}
            </Text>
          ) : (
            <>
              <Text>
                {action === "install" ? "Select plugins to install:" :
                 action === "remove" ? "Select plugins to remove:" :
                 action === "enable" ? "Select plugins to enable:" :
                 "Select plugins to disable:"}
              </Text>
              <Text dimColor>space to toggle · enter to confirm</Text>
              <MultiSelect
                options={filteredOptions}
                visibleOptionCount={Math.min(filteredOptions.length, 10)}
                onSubmit={handlePluginSubmit}
              />
            </>
          )}
        </Box>
      )}

      {step === "plugin-list" && (
        <Box flexDirection="column" gap={1}>
          <Text bold>{instancePlugins.length} plugin(s) installed in '{selectedInstance}':</Text>
          {instancePlugins.map((p, i) => (
            <PluginRow key={p.id} plugin={p} index={i} />
          ))}
        </Box>
      )}

      {step === "done" && (
        <PluginSuccess message={success} />
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
