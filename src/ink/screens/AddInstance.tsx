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
} from "@/ink/hooks/useConfig";
import { removeInstance as removeInstanceFromConfig } from "@/config";
import { removeWrapper } from "@/wrapper";
import { getClaudeMultiVersion } from "@/version";
import { useFadeIn } from "@/ink/hooks/useAnimations";
import { formatPluginLabel } from "@/ink/util/format";
import { join } from "node:path";
import { homedir } from "node:os";
import { CopyOption, PluginCategory } from "@/constants";
import { providerHasRegions, resolveRegionTemplate, MIMO_TOKEN_REGIONS, getApiKeyPlaceholder } from "@/templates";

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

enum Step {
  Name = "name",
  ProviderSelect = "provider-select",
  ProviderRegion = "provider-region",
  ProviderApiKey = "provider-apikey",
  PathsConfirm = "paths-confirm",
  CopyOptions = "copy-options",
  SelectPlugins = "select-plugins",
  Autosync = "autosync",
  Creating = "creating",
  Done = "done",
}

const STEP_TITLES: Record<Step, string> = {
  [Step.Name]: "Instance Name",
  [Step.ProviderSelect]: "Provider Template",
  [Step.ProviderRegion]: "Region",
  [Step.ProviderApiKey]: "API Key",
  [Step.PathsConfirm]: "Paths",
  [Step.CopyOptions]: "Copy Options",
  [Step.SelectPlugins]: "Select Plugins",
  [Step.Autosync]: "Auto-Sync",
  [Step.Creating]: "Creating...",
  [Step.Done]: "Complete",
};

const STEP_FLOW: Step[] = [
  Step.Name,
  Step.ProviderSelect,
  Step.ProviderRegion,
  Step.ProviderApiKey,
  Step.PathsConfirm,
  Step.CopyOptions,
  Step.SelectPlugins,
  Step.Autosync,
  Step.Creating,
  Step.Done,
];

function stepNumber(step: Step): number {
  return STEP_FLOW.indexOf(step) + 1;
}

interface WizardState {
  useProvider: boolean;
  selectedProvider: string | null;
  copyOption: string;
}

function isStepVisible(step: Step, state: WizardState): boolean {
  switch (step) {
    case Step.ProviderRegion:
      return !!state.selectedProvider && providerHasRegions(state.selectedProvider);
    case Step.ProviderApiKey:
      return state.useProvider;
    case Step.SelectPlugins:
      return state.copyOption === CopyOption.SelectPlugins;
    case Step.Autosync:
      return state.copyOption === CopyOption.All || state.copyOption === CopyOption.SelectPlugins;
    default:
      return true;
  }
}

function getVisibleSteps(state: WizardState): Step[] {
  return STEP_FLOW.filter((s) => isStepVisible(s, state));
}

function getPrevStep(current: Step, state: WizardState): Step | null {
  const visible = getVisibleSteps(state);
  const idx = visible.indexOf(current);
  return idx > 0 ? (visible[idx - 1] ?? null) : null;
}

function getNextStep(current: Step, state: WizardState): Step | null {
  const visible = getVisibleSteps(state);
  const idx = visible.indexOf(current);
  return idx >= 0 && idx < visible.length - 1 ? (visible[idx + 1] ?? null) : null;
}

function getVisibleStepCount(state: WizardState): number {
  return getVisibleSteps(state).filter(
    (s) => s !== Step.Creating && s !== Step.Done,
  ).length;
}

export const AddInstance: React.FC<{ onBack: () => void; initialName?: string }> = ({ onBack, initialName }) => {
  const { exit } = useApp();
  const cfg = useConfig();

  const [step, setStep] = useState<Step>(initialName ? Step.ProviderSelect : Step.Name);
  const [name, setName] = useState(initialName ?? "");
  const [error, setError] = useState("");
  const [useProvider, setUseProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [autoSync, setAutoSync] = useState(false);
  const [copyOption, setCopyOption] = useState<string>(CopyOption.None);
  const [selectedPluginIds, setSelectedPluginIds] = useState<string[]>([]);
  const [result, setResult] = useState<{ configDir: string; binaryPath: string } | null>(null);

  const defaultPlugins = useMemo(() => cfg.listDefaultPlugins(), [cfg]);

  const wizardState = useMemo<WizardState>(() => ({
    useProvider,
    selectedProvider,
    copyOption,
  }), [useProvider, selectedProvider, copyOption]);

  const navTo = useCallback((target: Step | null) => {
    if (target) {
      setStep(target);
      setError("");
    } else {
      onBack();
    }
  }, [onBack]);

  const goBack = useCallback(() => {
    navTo(getPrevStep(step, wizardState));
  }, [step, wizardState, navTo]);

  const goForward = useCallback(() => {
    const next = getNextStep(step, wizardState);
    if (next && next !== Step.Creating && next !== Step.Done) {
      navTo(next);
    }
  }, [step, wizardState, navTo]);

  useNavigation(() => {
    onBack();
  });

  useInput((input, key) => {
    if (input === "q" && step === Step.Done) exit();

    if (key.shift && key.leftArrow && step !== Step.Creating && step !== Step.Done) {
      goBack();
    }

    if (key.shift && key.rightArrow && step !== Step.Creating && step !== Step.Done) {
      goForward();
    }
  });

  const handleNameSubmit = useCallback((value: string) => {
    if (!value.trim()) { setError("Name is required"); return; }
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      setError("Only letters, numbers, hyphens, underscores allowed");
      return;
    }
    setError("");
    setName(value);
    setStep(Step.ProviderSelect);
  }, []);

  const handleProviderSelect = useCallback((value: string) => {
    if (value === CopyOption.None) {
      setUseProvider(false);
      setSelectedProvider(null);
      setStep(Step.PathsConfirm);
      return;
    }
    setUseProvider(true);
    setSelectedProvider(value);
    setStep(providerHasRegions(value) ? Step.ProviderRegion : Step.ProviderApiKey);
  }, []);

  const handleRegionSelect = useCallback((value: string) => {
    setSelectedRegion(value);
    setStep(Step.ProviderApiKey);
  }, []);

  const handleApiKeySubmit = useCallback((value: string) => {
    if (!value.trim()) { setError("API key is required"); return; }
    setError("");
    setApiKey(value);
    setStep(Step.PathsConfirm);
  }, []);

  const handleDefaultsConfirm = useCallback((_confirmed: boolean) => {
    setStep(Step.CopyOptions);
  }, []);

  const doCreate = useCallback(async (copyOpt: string, sync: boolean) => {
    setStep(Step.Creating);
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
        createdWithVersion: getClaudeMultiVersion(),
      };

      await cfg.addInstance(instance);
      await cfg.createWrapper(instance);
      await cfg.initializeInstanceState(cDir);

      if (copyOpt === CopyOption.SelectPlugins) {
        await cfg.copySettingsFromDefault(cDir);
        const selections = selectedPluginIds.map(id => {
          const plugin = defaultPlugins.find(p => p.id === id);
          return { id, category: plugin?.category ?? PluginCategory.External };
        });
        if (selections.length > 0) {
          await cfg.copySelectedPlugins(cDir, selections);
        }
      } else if (copyOpt === CopyOption.All) {
        await cfg.copyAllFromDefault(cDir);
      } else if (copyOpt === CopyOption.Settings) {
        await cfg.copySettingsFromDefault(cDir);
      }

      if (useProvider && selectedProvider) {
        let template = cfg.getProviderTemplate(selectedProvider);
        if (template && selectedRegion && providerHasRegions(selectedProvider)) {
          template = resolveRegionTemplate(template, selectedRegion);
        }
        if (template) await cfg.mergeProviderEnv(cDir, template, apiKey);
      }

      setResult({ configDir: cDir, binaryPath: bPath });
      setStep(Step.Done);
    } catch (err: unknown) {
      await removeInstanceFromConfig(name).catch(() => {});
      removeWrapper(cfg.getDefaultBinaryPath(name));
      setError(err instanceof Error ? err.message : String(err));
      setStep(Step.Name);
    }
  }, [name, apiKey, selectedProvider, selectedRegion, selectedPluginIds, useProvider, defaultPlugins, cfg]);

  const handleCopyOption = useCallback((value: string) => {
    setCopyOption(value);
    if (value === CopyOption.SelectPlugins) {
      setStep(Step.SelectPlugins);
    } else if (value === CopyOption.All) {
      setStep(Step.Autosync);
    } else {
      doCreate(value, false);
    }
  }, [doCreate]);

  const handlePluginSelection = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      setError("Select at least one plugin, or go back and choose a different option.");
      return;
    }
    setSelectedPluginIds(ids);
    setError("");
    setStep(Step.Autosync);
  }, []);

  const handleAutoSyncConfirm = useCallback((confirmed: boolean) => {
    setAutoSync(confirmed);
    doCreate(copyOption, confirmed);
  }, [copyOption, doCreate]);

  const hasDefaultConfig = cfg.hasDefaultConfig();

  const providerOptions = [
    ...cfg.getAvailableProviders().map((p) => ({
      label: `${p.displayName} — ${p.description}`,
      value: p.name,
    })),
    { label: "None / Custom", value: CopyOption.None },
  ];

  const copyOptions = [
    { label: "Nothing — start fresh", value: CopyOption.None },
    { label: "Only settings.json", value: CopyOption.Settings },
    { label: "Select plugins to install", value: CopyOption.SelectPlugins },
    { label: "All files (settings, CLAUDE.md, plugins, etc.)", value: CopyOption.All },
  ];

  const pluginSelectOptions = defaultPlugins.map(p => ({
    label: formatPluginLabel(p, { showCategory: true }),
    value: p.id,
  }));

  return (
    <Box flexDirection="column" width="100" paddingX={2} paddingY={1}>
      <Header title="➕ Add New Instance" />
      <StepIndicator current={stepNumber(step)} total={getVisibleStepCount(wizardState)} label={STEP_TITLES[step]} />

      {error && <StatusBar message={error} type="error" />}

      {step === Step.Name && (
        <Box flexDirection="column" gap={1}>
          <Text>Instance name:</Text>
          <Text dimColor>Letters, numbers, hyphens, underscores only</Text>
          <TextInput placeholder="my-instance" defaultValue={name} onSubmit={handleNameSubmit} />
        </Box>
      )}

      {step === Step.ProviderSelect && (
        <Box flexDirection="column" gap={1}>
          <Text>Select a provider:</Text>
          <Select
            options={providerOptions}
            visibleOptionCount={providerOptions.length}
            defaultValue={selectedProvider ?? undefined}
            onChange={handleProviderSelect}
          />
        </Box>
      )}

      {step === Step.ProviderRegion && (
        <Box flexDirection="column" gap={1}>
          <Text>Select your subscription region:</Text>
          <Box borderStyle="round" borderColor="yellow" paddingX={1}>
            <Text bold color="yellow">
              Check your Xiaomi account console to confirm the correct region for your subscription.
            </Text>
          </Box>
          <Select
            options={Object.entries(MIMO_TOKEN_REGIONS).map(([key, val]) => ({
              label: `${val.label} — ${val.baseUrl}`,
              value: key,
            }))}
            visibleOptionCount={3}
            defaultValue={selectedRegion ?? undefined}
            onChange={handleRegionSelect}
          />
        </Box>
      )}

      {step === Step.ProviderApiKey && (
        <Box flexDirection="column" gap={1}>
          <Text>Enter {selectedProvider} API key:</Text>
          <PasswordInput
            placeholder={selectedProvider ? getApiKeyPlaceholder(selectedProvider) : "sk-..."}
            onSubmit={handleApiKeySubmit}
          />
        </Box>
      )}

      {step === Step.PathsConfirm && (
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

      {step === Step.CopyOptions && !hasDefaultConfig && (
        <Box flexDirection="column" gap={1}>
          <Text dimColor>No default Claude config found. Starting fresh.</Text>
          <ConfirmInput
            onConfirm={() => doCreate(CopyOption.None, autoSync)}
            onCancel={onBack}
          />
        </Box>
      )}

      {step === Step.CopyOptions && hasDefaultConfig && (
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

      {step === Step.SelectPlugins && (
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

      {step === Step.Autosync && (
        <Box flexDirection="column" gap={1}>
          <Text>Auto-sync plugins and skills via symlinks?</Text>
          <Text dimColor>Shares plugins/skills from ~/.claude across instances</Text>
          <ConfirmInput
            onConfirm={() => handleAutoSyncConfirm(true)}
            onCancel={() => handleAutoSyncConfirm(false)}
          />
        </Box>
      )}

      {step === Step.Creating && (
        <Text dimColor>Creating instance...</Text>
      )}

      {step === Step.Done && result && (
        <AddResult name={name} binaryPath={result.binaryPath} configDir={result.configDir} />
      )}

      <Box marginTop={1}>
        <Text dimColor>Shift+← back │ Shift+→ next │ ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
