import { useState, useEffect, useCallback } from "react";
import {
  loadConfig,
  addInstance as addInstanceToConfig,
  removeInstance as removeInstanceFromConfig,
  getInstance as getInstanceFromConfig,
  updateInstanceSyncMode,
  getSyncMode,
  syncModeLabel,
  hasDefaultClaudeConfig,
  syncPluginsAndSkills,
  halfSyncPluginsAndSkills,
  enablePlugin,
  disablePlugin,
  detectBrokenSymlinks,
  copySettingsFromDefault,
  copyAllFromDefault,
  copyMcpServersBetweenInstances,
  initializeInstanceState,
  mergeProviderEnv,
  syncProviderTemplateForInstance,
  listDefaultPlugins,
  listInstancePlugins,
  copySelectedPlugins,
  removeSinglePlugin,
  isPluginsSymlinked,
  isHalfManualSync,
  getInstanceMcpServers,
  setCustomMcpServer,
  removeCustomMcpServer,
  type Instance,
  type Config,
  type PluginInfo,
} from "@/config";
import { createWrapper, removeWrapper, getDefaultBinaryPath } from "@/wrapper";
import { getAvailableProviders, getProviderTemplate, providerHasRegions, resolveRegionTemplate, getApiKeyPlaceholder } from "@/templates";
import { getMigrationStatus, needsInstanceMigration } from "@/migration";
import { ClaudeMultiError, ErrorCode } from "@/errors";
import { type SyncMode as SyncModeType } from "@/constants";

export { type Instance, type PluginInfo };

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await loadConfig();
      setConfig(cfg);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addInstance = useCallback(async (instance: Instance) => {
    await addInstanceToConfig(instance);
    await reload();
  }, [reload]);

  const removeInstance = useCallback(async (name: string) => {
    const instance = await getInstanceFromConfig(name);
    if (!instance) throw new ClaudeMultiError(ErrorCode.INSTANCE_NOT_FOUND, `Instance '${name}' not found`);
    await removeInstanceFromConfig(name);
    removeWrapper(instance.binaryPath);
    await reload();
    return instance;
  }, [reload]);

  const toggleSyncMode = useCallback(async (name: string, newMode: SyncModeType) => {
    await updateInstanceSyncMode(name, newMode);
    await reload();
  }, [reload]);

  const syncTemplateEnv = useCallback(async (instance: Instance) => {
    await syncProviderTemplateForInstance(instance);
    await reload();
  }, [reload]);

  const regenerateWrapper = useCallback(async (instance: Instance) => {
    await createWrapper({
      name: instance.name,
      configDir: instance.configDir,
      binaryPath: instance.binaryPath,
    });
    await reload();
  }, [reload]);

  const migrationStatus = config ? getMigrationStatus(config) : null;
  const instanceMigrationsPending = config ? needsInstanceMigration(config) : false;

  return {
    config,
    instances: config?.instances ?? [],
    loading,
    error,
    reload,
    addInstance,
    removeInstance,
    toggleSyncMode,
    syncTemplateEnv,
    regenerateWrapper,
    migrationStatus,
    instanceMigrationsPending,
    getInstance: getInstanceFromConfig,
    getSyncMode,
    syncModeLabel,
    hasDefaultConfig: hasDefaultClaudeConfig,
    enablePlugin,
    disablePlugin,
    detectBrokenSymlinks,
    copySettingsFromDefault,
    copyAllFromDefault,
    copyMcpServersBetweenInstances,
    createWrapper,
    removeWrapper,
    getDefaultBinaryPath,
    getAvailableProviders,
    getProviderTemplate,
    providerHasRegions,
    resolveRegionTemplate,
    getApiKeyPlaceholder,
    syncPluginsAndSkills,
    halfSyncPluginsAndSkills,
    initializeInstanceState,
    mergeProviderEnv,
    listDefaultPlugins,
    listInstancePlugins,
    copySelectedPlugins,
    removeSinglePlugin,
    isPluginsSymlinked,
    isHalfManualSync,
    getInstanceMcpServers,
    setCustomMcpServer,
    removeCustomMcpServer,
  };
}
