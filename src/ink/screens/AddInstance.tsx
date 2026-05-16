import React, { useState, useCallback, useMemo } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { TextInput, Select, ConfirmInput, PasswordInput, MultiSelect } from "@inkjs/ui";
import { Header } from "@/ink/components/Header";
import { StepIndicator } from "@/ink/components/StepIndicator";
import { StatusBar } from "@/ink/components/StatusBar";
import { useNavigation } from "@/ink/hooks/useNavigation";
import {
  useConfig,
  type Instance,
  type PluginInfo,
} from "@/ink/hooks/useConfig";
import { useFadeIn } from "@/ink/hooks/useAnimations";
import { formatPluginLabel } from "@/ink/util/format";
import { join } from "node:path";
import { homedir } from "node:os";

const AddResult: React.FC<{ name: string; binaryPath: string; configDir: string }> = ({
  name, binaryPath, configDir,
}) => {
  const showStatus = useFadeIn(50);
  const showPaths = useFadeIn(200);
  return (
    <Box flexDirection="column" gap={1}>
      {showStatus && <StatusBar message={`Instance '${name}' created successfully!`} type="success" />}
      {showPaths && (
        <Box marginLeft={2} flexDirection="column">
          <Box gap={1}>
            <Text dimColor>├─</Text>
            <Text dimColor bold>Binary:</Text>
            <Text>{binaryPath}</Text>
          </Box>
          <Box gap={1}>
            <Text dimColor>└─</Text>
            <Text dimColor bold>Config:</Text>
            <Text>{configDir}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

type Step =
  | "name"
  | "provider-select"
  | "provider-apikey"
  | "paths-confirm"
  | "copy-options"
  | "select-plugins"
  | "autosync"
  | "creating"
  | "done";

const STEP_TITLES: Record<Step, string> = {
  name: "Instance Name",
  "provider-select": "Provider Template",
  "provider-apikey": "API Key",
  "paths-confirm": "Paths",
  "copy-options": "Copy Options",
  "select-plugins": "Select Plugins",
  autosync: "Auto-Sync",
  creating: "Creating...",
  done: "Complete",
};

const STEP_ORDER: Step[] = [
  "name", "provider-select", "provider-apikey",
  "paths-confirm", "copy-options", "select-plugins", "autosync", "creating", "done",
];

function stepNumber(step: Step): number {
  return STEP_ORDER.indexOf(step) + 1;
}

export const AddInstance: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { exit } = useApp();
  const cfg = useConfig();

  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [useProvider, setUseProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [autoSync, setAutoSync] = useState(false);
  const [copyOption, setCopyOption] = useState<string>("none");
  const [selectedPluginIds, setSelectedPluginIds] = useState<string[]>([]);
  const [result, setResult] = useState<{ configDir: string; binaryPath: string } | null>(null);

  const defaultPlugins = useMemo(() => cfg.listDefaultPlugins(), [cfg]);

  useNavigation(() => {
    if (step === "done") onBack();
    else onBack();
  });

  useInput((input) => {
    if (input === "q" && step === "done") exit();
  });

  const goBack = useCallback(() => {
    const prevMap: Partial<Record<Step, Step>> = {
      "provider-select": "name",
      "provider-apikey": "provider-select",
      "paths-confirm": "provider-select",
      "copy-options": "paths-confirm",
      "select-plugins": "copy-options",
      autosync: "copy-options",
    };
    const prev = prevMap[step];
    if (prev) {
      setStep(prev);
      setError("");
    } else {
      onBack();
    }
  }, [step, onBack]);

  const handleNameSubmit = useCallback((value: string) => {
    if (!value.trim()) { setError("Name is required"); return; }
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      setError("Only letters, numbers, hyphens, underscores allowed");
      return;
    }
    setError("");
    setName(value);
    setStep("provider-select");
  }, []);

  const handleProviderSelect = useCallback((value: string) => {
    if (value === "none") {
      setUseProvider(false);
      setStep("paths-confirm");
      return;
    }
    setSelectedProvider(value);
    setStep("provider-apikey");
  }, []);

  const handleApiKeySubmit = useCallback((value: string) => {
    if (!value.trim()) { setError("API key is required"); return; }
    setError("");
    setApiKey(value);
    setStep("paths-confirm");
  }, []);

  const handleDefaultsConfirm = useCallback((_confirmed: boolean) => {
    setStep("copy-options");
  }, []);

  const handleCopyOption = useCallback((value: string) => {
    setCopyOption(value);
    if (value === "select-plugins") {
      setStep("select-plugins");
    } else if (value === "all") {
      setStep("autosync");
    } else {
      doCreate(value, false);
    }
  }, [name, useProvider, selectedProvider, apiKey]);

  const handlePluginSelection = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      setError("Select at least one plugin, or go back and choose a different option.");
      return;
    }
    setSelectedPluginIds(ids);
    setError("");
    setStep("autosync");
  }, []);

  const handleAutoSyncConfirm = useCallback((confirmed: boolean) => {
    setAutoSync(confirmed);
    doCreate(copyOption, confirmed);
  }, [copyOption, selectedPluginIds]);

  const doCreate = async (copyOpt: string, sync: boolean) => {
    setStep("creating");
    setError("");

    try {
      const cDir = join(homedir(), `.claude-${name}`);
      const bPath = cfg.getDefaultBinaryPath(name);

      const instance: Instance = {
        name,
        configDir: cDir,
        binaryPath: bPath,
        createdAt: new Date().toISOString(),
        autoSync: sync,
      };

      await cfg.addInstance(instance);
      await cfg.createWrapper(instance);
      await cfg.initializeInstanceState(cDir);

      if (copyOpt === "select-plugins") {
        // Copy settings first
        await cfg.copySettingsFromDefault(cDir);
        // Copy selected plugins
        const selections = selectedPluginIds.map(id => {
          const plugin = defaultPlugins.find(p => p.id === id);
          return { id, category: plugin?.category ?? "external" as const };
        });
        if (selections.length > 0) {
          await cfg.copySelectedPlugins(cDir, selections);
        }
      } else if (copyOpt === "all") {
        await cfg.copyAllFromDefault(cDir);
      } else if (copyOpt === "settings") {
        await cfg.copySettingsFromDefault(cDir);
      }

      if (useProvider && selectedProvider) {
        const template = cfg.getProviderTemplate(selectedProvider);
        if (template) await cfg.mergeProviderEnv(cDir, template, apiKey);
      }

      setResult({ configDir: cDir, binaryPath: bPath });
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setStep("name");
    }
  };

  const hasDefaultConfig = cfg.hasDefaultConfig();

  const providerOptions = [
    ...cfg.getAvailableProviders().map((p) => ({
      label: `${p.displayName} — ${p.description}`,
      value: p.name,
    })),
    { label: "None / Custom", value: "none" },
  ];

  const copyOptions = [
    { label: "Nothing — start fresh", value: "none" },
    { label: "Only settings.json", value: "settings" },
    { label: "Select plugins to install", value: "select-plugins" },
    { label: "All files (settings, CLAUDE.md, plugins, etc.)", value: "all" },
  ];

  const pluginSelectOptions = defaultPlugins.map(p => ({
    label: formatPluginLabel(p, { showCategory: true }),
    value: p.id,
  }));

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="➕ Add New Instance" />
      <StepIndicator current={stepNumber(step)} total={3} label={STEP_TITLES[step]} />

      {error && <StatusBar message={error} type="error" />}

      {step === "name" && (
        <Box flexDirection="column" gap={1}>
          <Text>Instance name:</Text>
          <Text dimColor>Letters, numbers, hyphens, underscores only</Text>
          <TextInput placeholder="my-instance" onSubmit={handleNameSubmit} />
        </Box>
      )}

      {step === "provider-select" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select a provider:</Text>
          <Select
            options={providerOptions}
            visibleOptionCount={providerOptions.length}
            onChange={handleProviderSelect}
          />
        </Box>
      )}

      {step === "provider-apikey" && (
        <Box flexDirection="column" gap={1}>
          <Text>Enter {selectedProvider} API key:</Text>
          <PasswordInput placeholder="sk-..." onSubmit={handleApiKeySubmit} />
        </Box>
      )}

      {step === "paths-confirm" && (
        <Box flexDirection="column" gap={1}>
          <Text>Use default paths?</Text>
          <Text dimColor>Config: {join(homedir(), `.claude-${name}`)}</Text>
          <Text dimColor>Binary: {cfg.getDefaultBinaryPath(name)}</Text>
          <ConfirmInput
            onConfirm={() => handleDefaultsConfirm(true)}
            onCancel={() => handleDefaultsConfirm(false)}
          />
        </Box>
      )}

      {step === "copy-options" && !hasDefaultConfig && (
        <Box flexDirection="column" gap={1}>
          <Text dimColor>No default Claude config found. Starting fresh.</Text>
          <ConfirmInput
            onConfirm={() => doCreate("none", autoSync)}
            onCancel={onBack}
          />
        </Box>
      )}

      {step === "copy-options" && hasDefaultConfig && (
        <Box flexDirection="column" gap={1}>
          <Text>Found existing Claude config at ~/.claude</Text>
          <Text>What to copy?</Text>
          <Select
            options={copyOptions}
            visibleOptionCount={copyOptions.length}
            onChange={handleCopyOption}
          />
        </Box>
      )}

      {step === "select-plugins" && (
        <Box flexDirection="column" gap={1}>
          <Text>Select plugins to install:</Text>
          <Text dimColor>{defaultPlugins.length} available · space to toggle · enter to confirm</Text>
          <MultiSelect
            options={pluginSelectOptions}
            visibleOptionCount={Math.min(pluginSelectOptions.length, 10)}
            onSubmit={handlePluginSelection}
          />
        </Box>
      )}

      {step === "autosync" && (
        <Box flexDirection="column" gap={1}>
          <Text>Auto-sync plugins and skills via symlinks?</Text>
          <Text dimColor>Shares plugins/skills from ~/.claude across instances</Text>
          <ConfirmInput
            onConfirm={() => handleAutoSyncConfirm(true)}
            onCancel={() => handleAutoSyncConfirm(false)}
          />
        </Box>
      )}

      {step === "creating" && (
        <Text dimColor>Creating instance...</Text>
      )}

      {step === "done" && result && (
        <AddResult name={name} binaryPath={result.binaryPath} configDir={result.configDir} />
      )}

      <Box marginTop={1}>
        <Text dimColor>ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
