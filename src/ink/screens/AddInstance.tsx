import React, { useReducer, useCallback, useMemo } from "react";
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
import { providerHasRegions, resolveRegionTemplate, getProviderRegions, getApiKeyPlaceholder } from "@/templates";

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

// --- Reducer state and actions ---

type AddInstanceState = {
  step: Step;
  name: string;
  error: string;
  useProvider: boolean;
  selectedProvider: string | null;
  selectedRegion: string | null;
  apiKey: string;
  autoSync: boolean;
  copyOption: string;
  selectedPluginIds: string[];
  result: { configDir: string; binaryPath: string } | null;
};

type AddInstanceAction =
  | { type: "SET_STEP"; step: Step }
  | { type: "SET_NAME"; name: string }
  | { type: "SET_ERROR"; error: string }
  | { type: "SELECT_PROVIDER"; provider: string | null; useProvider: boolean }
  | { type: "SET_REGION"; region: string | null }
  | { type: "SET_API_KEY"; key: string }
  | { type: "SET_AUTO_SYNC"; value: boolean }
  | { type: "SET_COPY_OPTION"; value: string }
  | { type: "SET_PLUGIN_IDS"; ids: string[] }
  | { type: "SET_RESULT"; result: { configDir: string; binaryPath: string } | null }
  | { type: "RESET" };

function reducer(state: AddInstanceState, action: AddInstanceAction): AddInstanceState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step, error: "" };
    case "SET_NAME":
      return { ...state, name: action.name };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SELECT_PROVIDER":
      // Clear stale region when switching away from a regional provider
      if (!action.provider || !providerHasRegions(action.provider)) {
        return { ...state, selectedProvider: action.provider, useProvider: action.useProvider, selectedRegion: null };
      }
      return { ...state, selectedProvider: action.provider, useProvider: action.useProvider };
    case "SET_REGION":
      return { ...state, selectedRegion: action.region };
    case "SET_API_KEY":
      return { ...state, apiKey: action.key };
    case "SET_AUTO_SYNC":
      return { ...state, autoSync: action.value };
    case "SET_COPY_OPTION":
      return { ...state, copyOption: action.value };
    case "SET_PLUGIN_IDS":
      return { ...state, selectedPluginIds: action.ids };
    case "SET_RESULT":
      return { ...state, result: action.result };
    case "RESET":
      return { ...state, error: "" };
    default:
      return state;
  }
}

function initialState(initialName?: string): AddInstanceState {
  return {
    step: initialName ? Step.ProviderSelect : Step.Name,
    name: initialName ?? "",
    error: "",
    useProvider: false,
    selectedProvider: null,
    selectedRegion: null,
    apiKey: "",
    autoSync: false,
    copyOption: CopyOption.None,
    selectedPluginIds: [],
    result: null,
  };
}

// --- Sub-components for each wizard step ---

const NameStep: React.FC<{
  state: AddInstanceState;
  dispatch: React.Dispatch<AddInstanceAction>;
  onSubmit: (value: string) => void;
}> = ({ state, onSubmit }) => (
  <Box flexDirection="column" gap={1}>
    <Text>Instance name:</Text>
    <Text dimColor>Letters, numbers, hyphens, underscores only</Text>
    <TextInput
      placeholder="my-instance"
      defaultValue={state.name}
      onSubmit={onSubmit}
    />
  </Box>
);

const ProviderSelectStep: React.FC<{
  state: AddInstanceState;
  dispatch: React.Dispatch<AddInstanceAction>;
  providerOptions: { label: string; value: string }[];
  onSelect: (value: string) => void;
}> = ({ state, providerOptions, onSelect }) => (
  <Box flexDirection="column" gap={1}>
    <Text>Select a provider:</Text>
    <Select
      options={providerOptions}
      visibleOptionCount={providerOptions.length}
      defaultValue={state.selectedProvider ?? undefined}
      onChange={onSelect}
    />
  </Box>
);

const ProviderRegionStep: React.FC<{
  state: AddInstanceState;
  dispatch: React.Dispatch<AddInstanceAction>;
  onSelect: (value: string) => void;
}> = ({ state, onSelect }) => {
  const regions = state.selectedProvider ? getProviderRegions(state.selectedProvider) : undefined;
  return (
    <Box flexDirection="column" gap={1}>
      <Text>Select your subscription region:</Text>
      <Box borderStyle="round" borderColor="yellow" paddingX={1}>
        <Text bold color="yellow">
          Check your account console to confirm the correct region for your subscription.
        </Text>
      </Box>
      <Select
        options={regions ? Object.entries(regions).map(([key, val]) => ({
          label: `${val.label} — ${val.baseUrl}`,
          value: key,
        })) : []}
        visibleOptionCount={3}
        defaultValue={state.selectedRegion ?? undefined}
        onChange={onSelect}
      />
    </Box>
  );
};

const ProviderApiKeyStep: React.FC<{
  state: AddInstanceState;
  dispatch: React.Dispatch<AddInstanceAction>;
  onSubmit: (value: string) => void;
}> = ({ state, onSubmit }) => (
  <Box flexDirection="column" gap={1}>
    <Text>Enter {state.selectedProvider} API key:</Text>
    <PasswordInput
      placeholder={state.selectedProvider ? getApiKeyPlaceholder(state.selectedProvider) : "sk-..."}
      onSubmit={onSubmit}
    />
  </Box>
);

const PathsConfirmStep: React.FC<{
  state: AddInstanceState;
  cfg: ReturnType<typeof useConfig>;
  onConfirm: (confirmed: boolean) => void;
}> = ({ state, cfg, onConfirm }) => (
  <Box flexDirection="column" gap={1}>
    <Text>Use default paths?</Text>
    <Text dimColor>Config: {join(homedir(), `.claude-${state.name}`)}</Text>
    <Text dimColor>Binary: {cfg.getDefaultBinaryPath(state.name)}</Text>
    <ConfirmInput
      onConfirm={() => onConfirm(true)}
      onCancel={() => onConfirm(false)}
    />
  </Box>
);

const SelectPluginsStep: React.FC<{
  pluginSelectOptions: { label: string; value: string }[];
  defaultPluginsLength: number;
  onSubmit: (ids: string[]) => void;
}> = ({ pluginSelectOptions, defaultPluginsLength, onSubmit }) => (
  <Box flexDirection="column" gap={1}>
    <Text>Select plugins to install:</Text>
    <Text dimColor>{defaultPluginsLength} available · space to toggle · enter to confirm</Text>
    <MultiSelect
      options={pluginSelectOptions}
      visibleOptionCount={Math.min(pluginSelectOptions.length, 10)}
      onSubmit={onSubmit}
    />
  </Box>
);

const AutosyncStep: React.FC<{
  onConfirm: (confirmed: boolean) => void;
}> = ({ onConfirm }) => (
  <Box flexDirection="column" gap={1}>
    <Text>Auto-sync plugins and skills via symlinks?</Text>
    <Text dimColor>Shares plugins/skills from ~/.claude across instances</Text>
    <ConfirmInput
      onConfirm={() => onConfirm(true)}
      onCancel={() => onConfirm(false)}
    />
  </Box>
);

export const AddInstance: React.FC<{ onBack: () => void; initialName?: string }> = ({ onBack, initialName }) => {
  const { exit } = useApp();
  const cfg = useConfig();

  const [state, dispatch] = useReducer(reducer, initialName, initialState);

  const defaultPlugins = useMemo(() => cfg.listDefaultPlugins(), [cfg]);

  const wizardState = useMemo<WizardState>(() => ({
    useProvider: state.useProvider,
    selectedProvider: state.selectedProvider,
    copyOption: state.copyOption,
  }), [state.useProvider, state.selectedProvider, state.copyOption]);

  const navTo = useCallback((target: Step | null) => {
    if (target) {
      dispatch({ type: "SET_STEP", step: target });
    } else {
      onBack();
    }
  }, [onBack]);

  const goBack = useCallback(() => {
    navTo(getPrevStep(state.step, wizardState));
  }, [state.step, wizardState, navTo]);

  const goForward = useCallback(() => {
    const next = getNextStep(state.step, wizardState);
    if (next && next !== Step.Creating && next !== Step.Done) {
      navTo(next);
    }
  }, [state.step, wizardState, navTo]);

  useNavigation(() => {
    onBack();
  });

  useInput((input, key) => {
    if (input === "q" && state.step === Step.Done) exit();

    if (key.shift && key.leftArrow && state.step !== Step.Creating && state.step !== Step.Done) {
      goBack();
    }

    if (key.shift && key.rightArrow && state.step !== Step.Creating && state.step !== Step.Done) {
      goForward();
    }
  });

  const handleNameSubmit = useCallback((value: string) => {
    if (!value.trim()) { dispatch({ type: "SET_ERROR", error: "Name is required" }); return; }
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      dispatch({ type: "SET_ERROR", error: "Only letters, numbers, hyphens, underscores allowed" });
      return;
    }
    dispatch({ type: "SET_NAME", name: value });
    dispatch({ type: "SET_STEP", step: Step.ProviderSelect });
  }, []);

  const handleProviderSelect = useCallback((value: string) => {
    if (value === CopyOption.None) {
      dispatch({ type: "SELECT_PROVIDER", provider: null, useProvider: false });
      dispatch({ type: "SET_STEP", step: Step.PathsConfirm });
      return;
    }
    dispatch({ type: "SELECT_PROVIDER", provider: value, useProvider: true });
    dispatch({ type: "SET_STEP", step: providerHasRegions(value) ? Step.ProviderRegion : Step.ProviderApiKey });
  }, []);

  const handleRegionSelect = useCallback((value: string) => {
    dispatch({ type: "SET_REGION", region: value });
    dispatch({ type: "SET_STEP", step: Step.ProviderApiKey });
  }, []);

  const handleApiKeySubmit = useCallback((value: string) => {
    if (!value.trim()) { dispatch({ type: "SET_ERROR", error: "API key is required" }); return; }
    dispatch({ type: "SET_API_KEY", key: value });
    dispatch({ type: "SET_STEP", step: Step.PathsConfirm });
  }, []);

  const handleDefaultsConfirm = useCallback((_confirmed: boolean) => {
    dispatch({ type: "SET_STEP", step: Step.CopyOptions });
  }, []);

  const doCreate = useCallback(async (copyOpt: string, sync: boolean) => {
    dispatch({ type: "SET_STEP", step: Step.Creating });
    dispatch({ type: "SET_ERROR", error: "" });

    try {
      const cDir = join(homedir(), `.claude-${state.name}`);
      const bPath = cfg.getDefaultBinaryPath(state.name);

      const instance: Instance = {
        name: state.name,
        configDir: cDir,
        binaryPath: bPath,
        createdAt: new Date().toISOString(),
        autoSync: sync,
        createdWithVersion: getClaudeMultiVersion(),
        ...(state.useProvider && state.selectedProvider ? { providerTemplate: state.selectedProvider } : {}),
        ...(state.selectedRegion && state.useProvider && state.selectedProvider && providerHasRegions(state.selectedProvider)
          ? { providerRegion: state.selectedRegion }
          : {}),
      };

      await cfg.addInstance(instance);
      await Promise.all([
        cfg.createWrapper(instance),
        cfg.initializeInstanceState(cDir),
      ]);

      if (copyOpt === CopyOption.SelectPlugins) {
        await cfg.copySettingsFromDefault(cDir);
        const selections = state.selectedPluginIds.map(id => {
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

      if (state.useProvider && state.selectedProvider) {
        let template = cfg.getProviderTemplate(state.selectedProvider);
        if (template && state.selectedRegion && providerHasRegions(state.selectedProvider)) {
          template = resolveRegionTemplate(template, state.selectedRegion);
        }
        if (template) await cfg.mergeProviderEnv(cDir, template, state.apiKey);
      }

      dispatch({ type: "SET_RESULT", result: { configDir: cDir, binaryPath: bPath } });
      dispatch({ type: "SET_STEP", step: Step.Done });
    } catch (err: unknown) {
      await removeInstanceFromConfig(state.name).catch(() => {});
      removeWrapper(cfg.getDefaultBinaryPath(state.name));
      dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : String(err) });
      dispatch({ type: "SET_STEP", step: Step.Name });
    }
  }, [state.name, state.apiKey, state.selectedProvider, state.selectedRegion, state.selectedPluginIds, state.useProvider, defaultPlugins, cfg]);

  const handleCopyOption = useCallback((value: string) => {
    dispatch({ type: "SET_COPY_OPTION", value });
    if (value === CopyOption.SelectPlugins) {
      dispatch({ type: "SET_STEP", step: Step.SelectPlugins });
    } else if (value === CopyOption.All) {
      dispatch({ type: "SET_STEP", step: Step.Autosync });
    } else {
      doCreate(value, false);
    }
  }, [doCreate]);

  const handlePluginSelection = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      dispatch({ type: "SET_ERROR", error: "Select at least one plugin, or go back and choose a different option." });
      return;
    }
    dispatch({ type: "SET_PLUGIN_IDS", ids });
    dispatch({ type: "SET_STEP", step: Step.Autosync });
  }, []);

  const handleAutoSyncConfirm = useCallback((confirmed: boolean) => {
    dispatch({ type: "SET_AUTO_SYNC", value: confirmed });
    doCreate(state.copyOption, confirmed);
  }, [state.copyOption, doCreate]);

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
      <StepIndicator current={stepNumber(state.step)} total={getVisibleStepCount(wizardState)} label={STEP_TITLES[state.step]} />

      {state.error && <StatusBar message={state.error} type="error" />}

      {state.step === Step.Name && (
        <NameStep state={state} dispatch={dispatch} onSubmit={handleNameSubmit} />
      )}

      {state.step === Step.ProviderSelect && (
        <ProviderSelectStep state={state} dispatch={dispatch} providerOptions={providerOptions} onSelect={handleProviderSelect} />
      )}

      {state.step === Step.ProviderRegion && (
        <ProviderRegionStep state={state} dispatch={dispatch} onSelect={handleRegionSelect} />
      )}

      {state.step === Step.ProviderApiKey && (
        <ProviderApiKeyStep state={state} dispatch={dispatch} onSubmit={handleApiKeySubmit} />
      )}

      {state.step === Step.PathsConfirm && (
        <PathsConfirmStep state={state} cfg={cfg} onConfirm={handleDefaultsConfirm} />
      )}

      {state.step === Step.CopyOptions && !hasDefaultConfig && (
        <Box flexDirection="column" gap={1}>
          <Text dimColor>No default Claude config found. Starting fresh.</Text>
          <ConfirmInput
            onConfirm={() => doCreate(CopyOption.None, state.autoSync)}
            onCancel={onBack}
          />
        </Box>
      )}

      {state.step === Step.CopyOptions && hasDefaultConfig && (
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

      {state.step === Step.SelectPlugins && (
        <SelectPluginsStep
          pluginSelectOptions={pluginSelectOptions}
          defaultPluginsLength={defaultPlugins.length}
          onSubmit={handlePluginSelection}
        />
      )}

      {state.step === Step.Autosync && (
        <AutosyncStep onConfirm={handleAutoSyncConfirm} />
      )}

      {state.step === Step.Creating && (
        <Text dimColor>Creating instance…</Text>
      )}

      {state.step === Step.Done && state.result && (
        <AddResult name={state.name} binaryPath={state.result.binaryPath} configDir={state.result.configDir} />
      )}

      <Box marginTop={1}>
        <Text dimColor>Shift+← back │ Shift+→ next │ ESC back │ q quit</Text>
      </Box>
    </Box>
  );
};
