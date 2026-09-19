import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TUNABLE_ENV_VARS } from "@/constants/env";

export interface ProviderTemplate {
  name: string;
  displayName: string;
  description: string;
  settings: {
    env: Record<string, string>;
    includeCoAuthoredBy: boolean;
    alwaysThinkingEnabled: boolean;
  };
}

/**
 * [SAFE PARK] intentionally empty — the user's installed claude-code binary is used as-is.
 * If a future Claude Code release breaks 3rd-party providers, re-add DISABLE_AUTOUPDATER/DISABLE_UPDATES: "1".
 */
const PROVIDER_COMMON_ENV: Record<string, string> = {};

const PROVIDER_TEMPLATES: Record<string, ProviderTemplate> = {
  glm: {
    name: "glm",
    displayName: "GLM Coding Plan",
    description: "GLM-5.3, GLM-5.3-Flash, and GLM-5-Turbo via z.ai Coding Plan subscription (Anthropic endpoint is coding-plan-only)",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://api.z.ai/api/anthropic",
        API_TIMEOUT_MS: "3000000",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "glm-5-turbo",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "glm-5.3-flash[1m]",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "glm-5.3[1m]",
        ANTHROPIC_MODEL: "glm-5.3[1m]",
        ANTHROPIC_SMALL_FAST_MODEL: "glm-5-turbo",
        ENABLE_THINKING: "true",
        REASONING_EFFORT: "high",
        MAX_THINKING_TOKENS: "8000",
        ENABLE_STREAMING: "true",
        MAX_OUTPUT_TOKENS: "128000",
        // [1m] opts into the 1M context window per Z.ai's Claude Code example (three-tier split).
        // No global CLAUDE_CODE_AUTO_COMPACT_WINDOW: one value can't fit the 1M and 200K models mixed here.
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: false,
    },
  },
  minimax: {
    name: "minimax",
    displayName: "MiniMax",
    description: "MiniMax-M3 — 1M context, frontier coding/agentic, native multimodal — via minimax.io",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://api.minimax.io/anthropic",
        API_TIMEOUT_MS: "3000000",
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
        ANTHROPIC_MODEL: "MiniMax-M3",
        ANTHROPIC_SMALL_FAST_MODEL: "MiniMax-M3",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "MiniMax-M3",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "MiniMax-M3",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "MiniMax-M3",
        ENABLE_THINKING: "true",
        REASONING_EFFORT: "high",
        MAX_OUTPUT_TOKENS: "512000",
        MAX_THINKING_TOKENS: "32000",
        CLAUDE_CODE_EFFORT_LEVEL: "max",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: false,
    },
  },
  deepseek: {
    name: "deepseek",
    displayName: "DeepSeek",
    description: "DeepSeek-V4-Pro and DeepSeek-V4-Flash models via deepseek.com",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://api.deepseek.com/anthropic",
        API_TIMEOUT_MS: "3000000",
        ANTHROPIC_MODEL: "deepseek-v4-pro[1m]",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "deepseek-v4-pro[1m]",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "deepseek-v4-pro[1m]",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "deepseek-v4-flash",
        ANTHROPIC_SMALL_FAST_MODEL: "deepseek-v4-flash",
        CLAUDE_CODE_SUBAGENT_MODEL: "deepseek-v4-flash",
        ENABLE_THINKING: "true",
        REASONING_EFFORT: "high",
        MAX_THINKING_TOKENS: "32000",
        MAX_OUTPUT_TOKENS: "128000",
        CLAUDE_CODE_EFFORT_LEVEL: "max",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: false,
    },
  },
  mimo: {
    name: "mimo",
    displayName: "Xiaomi MiMo",
    description: "MiMo-V2.5-Pro and MiMo-V2.5 via xiaomimimo.com — pay-per-token API",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://api.xiaomimimo.com/anthropic",
        API_TIMEOUT_MS: "3000000",
        ANTHROPIC_MODEL: "mimo-v2.5-pro[1m]",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "mimo-v2.5-pro[1m]",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "mimo-v2.5-pro[1m]",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "mimo-v2.5[1m]",
        ANTHROPIC_SMALL_FAST_MODEL: "mimo-v2.5[1m]",
        ENABLE_THINKING: "true",
        MAX_OUTPUT_TOKENS: "128000",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: false,
    },
  },
  "mimo-token": {
    name: "mimo-token",
    displayName: "Xiaomi MiMo (Token Plan)",
    description: "MiMo-V2.5-Pro via xiaomimimo.com Token Plan — monthly subscription with credit pool, replace base URL with your regional endpoint (CN/SG/EU) from the subscription console",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://token-plan-cn.xiaomimimo.com/anthropic",
        API_TIMEOUT_MS: "3000000",
        ANTHROPIC_MODEL: "mimo-v2.5-pro[1m]",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "mimo-v2.5-pro[1m]",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "mimo-v2.5-pro[1m]",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "mimo-v2.5[1m]",
        ANTHROPIC_SMALL_FAST_MODEL: "mimo-v2.5[1m]",
        ENABLE_THINKING: "true",
        MAX_OUTPUT_TOKENS: "128000",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: false,
    },
  },
  kimi: {
    name: "kimi",
    displayName: "Moonshot Kimi",
    description: "Kimi K2.7 Code, K2.6, K2.5 models via moonshot.ai — pay-per-token only, no subscription plan",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://api.moonshot.ai/anthropic",
        API_TIMEOUT_MS: "3000000",
        ANTHROPIC_MODEL: "kimi-k2.6",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "kimi-k2.7-code",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "kimi-k2.6",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "kimi-k2.5",
        ANTHROPIC_SMALL_FAST_MODEL: "kimi-k2.5",
        ENABLE_THINKING: "true",
        REASONING_EFFORT: "high",
        MAX_THINKING_TOKENS: "16000",
        MAX_OUTPUT_TOKENS: "65536",
        // 256K context; Claude Code assumes 200K for unrecognized models, so auto-compaction needs these.
        CLAUDE_CODE_AUTO_COMPACT_WINDOW: "262144",
        CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: "75",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: false,
    },
  },
  qwen: {
    name: "qwen",
    displayName: "Qwen (Alibaba)",
    description: "Qwen3-Coder and Qwen3.5 models via Alibaba DashScope — pay-per-token API",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://dashscope-intl.aliyuncs.com/apps/anthropic",
        API_TIMEOUT_MS: "3000000",
        ANTHROPIC_MODEL: "qwen3-coder-next",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "qwen3-coder-next",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "qwen3-coder-plus",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "qwen3-coder-flash",
        ANTHROPIC_SMALL_FAST_MODEL: "qwen3-coder-flash",
        ENABLE_THINKING: "true",
        REASONING_EFFORT: "high",
        MAX_THINKING_TOKENS: "16000",
        MAX_OUTPUT_TOKENS: "65536",
        // 128K context; Claude Code assumes 200K for unrecognized models, so auto-compaction needs these.
        CLAUDE_CODE_AUTO_COMPACT_WINDOW: "131072",
        CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: "75",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: false,
    },
  },
  "qwen-coding": {
    name: "qwen-coding",
    displayName: "Qwen Coding Plan (Alibaba)",
    description: "Qwen3-Coder and Qwen3.5 models via Alibaba DashScope Coding Plan subscription",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://coding-intl.dashscope.aliyuncs.com/apps/anthropic",
        API_TIMEOUT_MS: "3000000",
        ANTHROPIC_MODEL: "qwen3-coder-next",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "qwen3-coder-next",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "qwen3-coder-plus",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "qwen3-coder-flash",
        ANTHROPIC_SMALL_FAST_MODEL: "qwen3-coder-flash",
        ENABLE_THINKING: "true",
        REASONING_EFFORT: "high",
        MAX_THINKING_TOKENS: "16000",
        MAX_OUTPUT_TOKENS: "65536",
        // 128K context; Claude Code assumes 200K for unrecognized models, so auto-compaction needs these.
        CLAUDE_CODE_AUTO_COMPACT_WINDOW: "131072",
        CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: "75",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: false,
    },
  },
};

const API_KEY_PREFIXES: Record<string, string> = {
  "mimo-token": "tp_",
};

export function getApiKeyPlaceholder(providerName: string): string {
  const prefix = API_KEY_PREFIXES[providerName];
  return prefix ? `${prefix}...` : "sk-...";
}

export const MIMO_TOKEN_REGIONS: Record<string, { label: string; baseUrl: string }> = {
  cn: {
    label: "China",
    baseUrl: "https://token-plan-cn.xiaomimimo.com/anthropic",
  },
  sgp: {
    label: "Singapore",
    baseUrl: "https://token-plan-sgp.xiaomimimo.com/anthropic",
  },
  ams: {
    label: "Europe",
    baseUrl: "https://token-plan-ams.xiaomimimo.com/anthropic",
  },
};

/** Provider -> region map registry: add regional providers here and all region-aware code picks them up. */
const PROVIDER_REGION_MAPS: Record<string, Record<string, { label: string; baseUrl: string }>> = {
  "mimo-token": MIMO_TOKEN_REGIONS,
};

export function providerHasRegions(providerName: string): boolean {
  return providerName in PROVIDER_REGION_MAPS;
}

export function getProviderRegions(providerName: string): Record<string, { label: string; baseUrl: string }> | undefined {
  return PROVIDER_REGION_MAPS[providerName];
}

export function detectRegionFromBaseUrl(baseUrl: string): string | null {
  for (const regionMap of Object.values(PROVIDER_REGION_MAPS)) {
    for (const [regionCode, config] of Object.entries(regionMap)) {
      const escaped = config.baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`^${escaped}/?$`);
      if (regex.test(baseUrl)) {
        return regionCode;
      }
    }
  }
  return null;
}

export function resolveRegionTemplate(
  template: ProviderTemplate,
  region: string,
): ProviderTemplate {
  if (!providerHasRegions(template.name)) {
    return template;
  }

  const regionMap = PROVIDER_REGION_MAPS[template.name];
  const regionConfig = regionMap?.[region];
  if (!regionConfig) {
    throw new Error(
      `Unknown region '${region}' for ${template.name}. Available: ${regionMap ? Object.keys(regionMap).join(", ") : "none"}`,
    );
  }

  const resolved = structuredClone(template);
  resolved.settings.env.ANTHROPIC_BASE_URL = regionConfig.baseUrl;
  return resolved;
}

export function getAvailableProviders(): ProviderTemplate[] {
  return Object.values(PROVIDER_TEMPLATES);
}

export function getProviderTemplate(
  name: string,
): ProviderTemplate | undefined {
  return PROVIDER_TEMPLATES[name.toLowerCase()];
}

export function applyProviderTemplate(
  template: ProviderTemplate,
  apiKey: string,
): Record<string, unknown> {
  const settings = structuredClone(template.settings);
  settings.env = { ...PROVIDER_COMMON_ENV, ...settings.env };
  settings.env.ANTHROPIC_AUTH_TOKEN = apiKey;
  return settings;
}

export function getProviderByBaseUrl(baseUrl: string): string | null {
  // Normalize trailing slash (common in hand-edited settings.json) so migrations don't miss a known provider.
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  for (const [name, template] of Object.entries(PROVIDER_TEMPLATES)) {
    const templateUrl = template.settings.env.ANTHROPIC_BASE_URL;
    if (!templateUrl) continue;

    if (name === "mimo-token") {
      if (normalizedBaseUrl.startsWith("https://token-plan-")) continue;
      // won't match mimo-token by exact URL since regions vary
    }

    if (normalizedBaseUrl === templateUrl) return name;
  }

  const regionCode = detectRegionFromBaseUrl(normalizedBaseUrl);
  if (regionCode) {
    return "mimo-token";
  }

  return null;
}

export function detectProvider(configDir: string): string | null {
  try {
    const settingsFile = join(configDir, "settings.json");
    if (!existsSync(settingsFile)) return null;
    const raw = JSON.parse(readFileSync(settingsFile, "utf-8")) as Record<string, unknown>;
    const env = raw.env as Record<string, string> | undefined;
    if (!env?.ANTHROPIC_BASE_URL) return null;
    return getProviderByBaseUrl(env.ANTHROPIC_BASE_URL);
  } catch {
    return null;
  }
}

/**
 * Legacy template defaults: during "overwrite-legacy-defaults" sync these are stale, not user-customized.
 * Update in the same commit as any template change to a TUNABLE_ENV_VARS value.
 */
export const LEGACY_ENV_DEFAULTS: Readonly<Record<string, Partial<Record<string, readonly string[]>>>> = {
  glm: {
    MAX_OUTPUT_TOKENS: ["64000"],
    CLAUDE_CODE_AUTO_COMPACT_WINDOW: ["131072"],
    CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: ["75"],
  },
  minimax: {
    MAX_OUTPUT_TOKENS: ["64000"],
  },
};

export type TunableEnvPolicy = "preserve-custom" | "overwrite-legacy-defaults";

export interface ProviderEnvSyncOptions {
  /** Stored provider hint; falls back to detectProvider(configDir) */
  providerTemplate?: string;
  providerRegion?: string;
  /** How to treat TUNABLE_ENV_VARS that differ from the template. Default "preserve-custom". */
  tunablePolicy?: TunableEnvPolicy;
  dryRun?: boolean;
}

export type ProviderEnvSyncStatus = "synced" | "unchanged" | "skipped";

export interface ProviderEnvSyncResult {
  status: ProviderEnvSyncStatus;
  providerName: string | null;
  region: string | null;
  reason?: "no-settings" | "unknown-provider";
}

function isLegacyDefault(providerName: string, key: string, value: string): boolean {
  return (LEGACY_ENV_DEFAULTS[providerName]?.[key] ?? []).includes(value);
}

/**
 * Sync settings.json env to the provider template: API key, user-only vars, and tunables (per
 * tunablePolicy) survive. Throws on parse/IO errors; writes only when content actually changes.
 */
export function syncProviderEnvToSettings(
  configDir: string,
  options: ProviderEnvSyncOptions = {},
): ProviderEnvSyncResult {
  const providerName = options.providerTemplate ?? detectProvider(configDir);
  if (!providerName) {
    return { status: "skipped", providerName: null, region: null, reason: "unknown-provider" };
  }

  let template = getProviderTemplate(providerName);
  if (!template) {
    return { status: "skipped", providerName, region: null, reason: "unknown-provider" };
  }

  const settingsFile = join(configDir, "settings.json");
  if (!existsSync(settingsFile)) {
    return { status: "skipped", providerName, region: null, reason: "no-settings" };
  }

  const existing = JSON.parse(readFileSync(settingsFile, "utf-8")) as Record<string, unknown>;
  const before = JSON.stringify(existing, null, 2);
  const existingEnv = (existing.env as Record<string, string>) ?? {};
  const apiKey = existingEnv.ANTHROPIC_AUTH_TOKEN ?? "";
  const existingBaseUrl = existingEnv.ANTHROPIC_BASE_URL;

  // Regional: URL-detected region wins over the stored region (hand-edited URLs beat stale metadata).
  let region: string | null = null;
  if (providerHasRegions(providerName)) {
    const providerRegions = getProviderRegions(providerName);
    const detectedRegion = detectRegionFromBaseUrl(existingBaseUrl ?? "") ?? options.providerRegion;
    if (detectedRegion && providerRegions && detectedRegion in providerRegions) {
      template = resolveRegionTemplate(template, detectedRegion);
      region = detectedRegion;
    }
  }

  const templateSettings = structuredClone(template.settings);
  const templateEnv = templateSettings.env as Record<string, string>;
  const newEnv: Record<string, string> = { ...templateEnv, ANTHROPIC_AUTH_TOKEN: apiKey };

  // Unresolved region: keep existing base URL rather than silently defaulting regions
  if (providerHasRegions(providerName) && region === null && existingBaseUrl) {
    newEnv.ANTHROPIC_BASE_URL = existingBaseUrl;
  }

  const policy = options.tunablePolicy ?? "preserve-custom";
  for (const key of TUNABLE_ENV_VARS) {
    if (!(key in existingEnv)) continue;
    const value = existingEnv[key]!;
    if (value === templateEnv[key]) continue;
    if (policy === "overwrite-legacy-defaults" && isLegacyDefault(providerName, key, value)) continue;
    newEnv[key] = value;
  }

  const merged = { ...existingEnv, ...newEnv };

  if (policy === "overwrite-legacy-defaults") {
    for (const [key, values] of Object.entries(LEGACY_ENV_DEFAULTS[providerName] ?? {})) {
      if (!(key in templateEnv) && key in merged && values?.includes(merged[key]!)) {
        delete merged[key];
      }
    }
  }

  existing.env = merged;
  existing.includeCoAuthoredBy = template.settings.includeCoAuthoredBy;
  existing.alwaysThinkingEnabled = template.settings.alwaysThinkingEnabled;

  const after = JSON.stringify(existing, null, 2);
  if (after !== before && !options.dryRun) {
    writeFileSync(settingsFile, after, "utf-8");
  }

  return { status: after !== before ? "synced" : "unchanged", providerName, region };
}

/** Safety net: catches template drift even when a release forgets a versioned migration entry. */
export function needsProviderTemplateSync(
  configDir: string,
  options: Omit<ProviderEnvSyncOptions, "dryRun"> = {},
): boolean {
  try {
    return syncProviderEnvToSettings(configDir, {
      ...options,
      tunablePolicy: options.tunablePolicy ?? "overwrite-legacy-defaults",
      dryRun: true,
    }).status === "synced";
  } catch {
    // Corrupt/unreadable settings.json is a health issue, not grounds to apply a template
    return false;
  }
}
