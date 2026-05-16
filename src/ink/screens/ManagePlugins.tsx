import React, { useState, useMemo } from "react";
import { Box, Text } from "ink";
import { Select, MultiSelect, ConfirmInput } from "@inkjs/ui";
import { Header } from "@/ink/components/Header";
import { StatusBar } from "@/ink/components/StatusBar";
import { InstanceSelectMenu } from "@/ink/components/InstanceSelectMenu";
import { useNavigation } from "@/ink/hooks/useNavigation";
import { useConfig, type PluginInfo } from "@/ink/hooks/useConfig";
import { useMessage } from "@/ink/hooks/useMessage";
import { formatPluginLabel } from "@/ink/util/format";
import { useFadeIn } from "@/ink/hooks/useAnimations";
import { PluginAction, PluginCategory } from "@/constants";

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
      {plugin.category === PluginCategory.External && <Text dimColor>[ext]</Text>}
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
  const { error, setError, success, setSuccess } = useMessage();

  const filteredOptions = useMemo(() => {
    const showCat = action === PluginAction.Install || action === PluginAction.Remove;
    const plugins =
      action === PluginAction.Enable ? instancePlugins.filter(p => !p.enabled) :
      action === PluginAction.Disable ? instancePlugins.filter(p => p.enabled) :
      instancePlugins;
    return plugins.map(p => ({ label: formatPluginLabel(p, { showCategory: showCat }), value: p.id }));
  }, [action, instancePlugins]);

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
    if ([PluginAction.Install, PluginAction.Remove, PluginAction.Enable, PluginAction.Disable].includes(action ?? "" as PluginAction)) {
      if (isPluginsSymlinked(inst.configDir)) {
        setStep("symlink-warning");
        return;
      }
    }

    await loadInstancePluginData(value, inst.configDir);
  };

  const loadInstancePluginData = async (instName: string, configDir: string) => {
    try {
      if (action === PluginAction.Install) {
        // Show default plugins for selection
        const defaults = listDefaultPlugins();
        const installed = listInstancePlugins(configDir);
        const installedIds = new Set(installed.map(p => p.id));
        const available = defaults.filter(p => !installedIds.has(p.id));
        setInstancePlugins(available);
        setStep("select-plugins");
      } else if (action === PluginAction.Remove || action === PluginAction.Enable || action === PluginAction.Disable) {
        const plugins = listInstancePlugins(configDir);
        setInstancePlugins(plugins);
        setStep("select-plugins");
      } else if (action === PluginAction.List) {
        const plugins = listInstancePlugins(configDir);
        setInstancePlugins(plugins);
        setStep("plugin-list");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
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
      if (action === PluginAction.Install) {
        const defaults = listDefaultPlugins();
        const selections = selectedIds.map(id => {
          const p = defaults.find(dp => dp.id === id);
          return { id, category: p?.category ?? PluginCategory.External };
        });
        if (selections.length > 0) {
          await copySelectedPlugins(inst.configDir, selections);
        }
        setSuccess(`Installed ${selections.length} plugin(s) to '${selectedInstance}'`);
      } else if (action === PluginAction.Remove) {
        for (const id of selectedIds) {
          const p = instancePlugins.find(ip => ip.id === id);
          await removeSinglePlugin(inst.configDir, id, p?.category ?? PluginCategory.External);
        }
        setSuccess(`Removed ${selectedIds.length} plugin(s) from '${selectedInstance}'`);
      } else if (action === PluginAction.Enable) {
        for (const id of selectedIds) {
          await enablePlugin(inst.configDir, `${id}@claude-plugins-official`);
        }
        setSuccess(`Enabled ${selectedIds.length} plugin(s) for '${selectedInstance}'`);
      } else if (action === PluginAction.Disable) {
        for (const id of selectedIds) {
          await disablePlugin(inst.configDir, `${id}@claude-plugins-official`);
        }
        setSuccess(`Disabled ${selectedIds.length} plugin(s) for '${selectedInstance}'`);
      }
      await reload();
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setStep("action");
    }
  };

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="🔌 Manage Plugins" />

      {error && <StatusBar message={error} type="error" />}

      {step === "action" && (
        <Box flexDirection="column" gap={1}>
          <Text>What would you like to do?</Text>
          <Select
            options={[
              { label: "📥 Install plugins from default", value: PluginAction.Install },
              { label: "🗑️  Remove installed plugins", value: PluginAction.Remove },
              { label: "✅ Enable plugins", value: PluginAction.Enable },
              { label: "❌ Disable plugins", value: PluginAction.Disable },
              { label: "📋 List installed plugins", value: PluginAction.List },
              { label: "Cancel", value: "cancel" },
            ]}
            visibleOptionCount={6}
            onChange={handleAction}
          />
        </Box>
      )}

      {step === "select-instance" && (
        <InstanceSelectMenu instances={instances} onSelect={handleInstanceSelect} />
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
              {action === PluginAction.Install ? "All default plugins already installed." :
               action === PluginAction.Enable ? "All installed plugins are already enabled." :
               action === PluginAction.Disable ? "All installed plugins are already disabled." :
               action === PluginAction.Remove ? "No plugins installed to remove." :
               "No plugins found."}
            </Text>
          ) : (
            <>
              <Text>
                {action === PluginAction.Install ? "Select plugins to install:" :
                 action === PluginAction.Remove ? "Select plugins to remove:" :
                 action === PluginAction.Enable ? "Select plugins to enable:" :
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

      {step === "done" && success && (
        <PluginSuccess message={success} />
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
