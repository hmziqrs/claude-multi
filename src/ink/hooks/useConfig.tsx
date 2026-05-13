import { useState, useEffect, useCallback } from "react";
import {
  loadConfig,
  saveConfig,
  addInstance as addInstanceToConfig,
  removeInstance as removeInstanceFromConfig,
  getInstance as getInstanceFromConfig,
  listInstances as listInstancesFromConfig,
  updateInstanceAutoSync,
  hasDefaultClaudeConfig,
  hasDefaultMcpConfig,
  syncPluginsAndSkills,
  unsyncPluginsAndSkills,
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
  type Instance,
  type Config,
} from "../../config.js";
import { createWrapper, removeWrapper, getDefaultBinaryPath } from "../../wrapper.js";
import { getAvailableProviders, getProviderTemplate } from "../../templates.js";

export { type Instance };

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
      setError((err as Error).message);
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
    if (!instance) throw new Error(`Instance '${name}' not found`);
    await removeInstanceFromConfig(name);
    removeWrapper(instance.binaryPath);
    await reload();
    return instance;
  }, [reload]);

  const toggleAutoSync = useCallback(async (name: string, enable: boolean) => {
    const instance = await getInstanceFromConfig(name);
    if (!instance) throw new Error(`Instance '${name}' not found`);
    await updateInstanceAutoSync(name, enable);
    if (enable) {
      await syncPluginsAndSkills(instance.configDir);
    } else {
      await unsyncPluginsAndSkills(instance.configDir);
    }
    await reload();
  }, [reload]);

  return {
    config,
    instances: config?.instances ?? [],
    loading,
    error,
    reload,
    addInstance,
    removeInstance,
    toggleAutoSync,
    getInstance: getInstanceFromConfig,
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
    updateInstanceAutoSync,
    syncPluginsAndSkills,
  };
}
