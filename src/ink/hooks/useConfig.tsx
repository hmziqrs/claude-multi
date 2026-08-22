import { useState, useEffect, useCallback } from "react";
import {
  loadConfig,
  addInstance as addInstanceToConfig,
  removeInstance as removeInstanceFromConfig,
  getInstance as getInstanceFromConfig,
  listInstances as listInstancesFromConfig,
  updateInstanceAutoSync,
  updateInstanceSyncMode,
  getSyncMode,
  syncModeLabel,
  hasDefaultClaudeConfig,
  hasDefaultMcpConfig,
  syncPluginsAndSkills,
  unsyncPluginsAndSkills,
  halfSyncPluginsAndSkills,
  getEnabledPlugins,
  setEnabledPlugins,
  enablePlugin,
  disablePlugin,
  listAvailablePlugins,
  detectBrokenSymlinks,
  copySettingsFromDefault,
  copyAllFromDefault,
  copyMcpServersFromDefault,
  createSettingsFromTemplate,
  copyMcpServersBetweenInstances,
  listMcpServers,
  initializeInstanceState,
  mergeProviderEnv,
  syncProviderTemplateForInstance,
  listDefaultPlugins,
  listInstancePlugins,
  copySelectedPlugins,
  copySinglePlugin,
  removeSinglePlugin,
  isPluginsSymlinked,
  isHalfManualSync,
  getMcpServersFromPlugins,
  getInstanceMcpServers,
  setCustomMcpServer,
  removeCustomMcpServer,
  isClaudeCodeRunning,
  detectMcpCollisions,
  validatePluginOperation,
  type Instance,
  type Config,
  type PluginInfo,
} from "@/config";
import { createWrapper, removeWrapper, getDefaultBinaryPath } from "@/wrapper";
import { getAvailableProviders, getProviderTemplate, providerHasRegions, resolveRegionTemplate, MIMO_TOKEN_REGIONS, getApiKeyPlaceholder } from "@/templates";
import { getMigrationStatus, clearMigrationFailure, needsInstanceMigration } from "@/migration";
import { ClaudeMultiError, ErrorCode } from "@/errors";
import { SyncMode, type SyncMode as SyncModeType } from "@/constants";

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

  /** @deprecated Use toggleSyncMode instead */
  const toggleAutoSync = useCallback(async (name: string, enable: boolean) => {
    await toggleSyncMode(name, enable ? SyncMode.Auto : SyncMode.FullManual);
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
    toggleAutoSync,
    toggleSyncMode,
    syncTemplateEnv,
    regenerateWrapper,
    migrationStatus,
    instanceMigrationsPending,
    getInstance: getInstanceFromConfig,
    getSyncMode,
    syncModeLabel,
    listInstances: listInstancesFromConfig,
    hasDefaultConfig: hasDefaultClaudeConfig,
    hasDefaultMcpConfig,
    getEnabledPlugins,
    setEnabledPlugins,
    enablePlugin,
    disablePlugin,
    listAvailablePlugins,
    detectBrokenSymlinks,
    copySettingsFromDefault,
    copyAllFromDefault,
    copyMcpServersFromDefault,
    createSettingsFromTemplate,
    copyMcpServersBetweenInstances,
    listMcpServers,
    createWrapper,
    removeWrapper,
    getDefaultBinaryPath,
    getAvailableProviders,
    getProviderTemplate,
    providerHasRegions,
    resolveRegionTemplate,
    MIMO_TOKEN_REGIONS,
    getApiKeyPlaceholder,
    updateInstanceAutoSync,
    syncPluginsAndSkills,
    halfSyncPluginsAndSkills,
    initializeInstanceState,
    mergeProviderEnv,
    listDefaultPlugins,
    listInstancePlugins,
    copySelectedPlugins,
    copySinglePlugin,
    removeSinglePlugin,
    isPluginsSymlinked,
    isHalfManualSync,
    getMcpServersFromPlugins,
    getInstanceMcpServers,
    setCustomMcpServer,
    removeCustomMcpServer,
    isClaudeCodeRunning,
    detectMcpCollisions,
    validatePluginOperation,
    clearMigrationFailure,
  };
}
