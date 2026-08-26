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
 * [SAFE PARK] Env vars injected into every provider template.
 * claude-multi no longer bundles claude-code and does not pin versions;
 * the user's installed claude-code binary is used as-is.
 * To reactivate: add DISABLE_AUTOUPDATER: "1" and DISABLE_UPDATES: "1"
 * if a future Claude Code release breaks 3rd-party provider compatibility.
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
        // Three-tier mapping. Opus and main run glm-5.3[1m], Z.ai's GLM Coding Plan
        // flagship — the [1m] suffix opts into the 1M context window per-model,
        // following Z.ai's official Claude Code example. Sonnet runs glm-5.3-flash[1m],
        // Z.ai's efficiency model (native multimodal, same 1M context window), which
        // bills against 3x the coding-plan quota of GLM-5.3. Haiku and small-fast stay
        // glm-5-turbo (200K — Claude Code's default assumption for unrecognized models
        // matches it). Still no global CLAUDE_CODE_AUTO_COMPACT_WINDOW: one value can't
        // fit the 1M and 200K models this template mixes.
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
        // Kimi K2.7 Code/K2.6/K2.5 have a 256K context window. Claude Code assumes 200K for
        // unrecognized models, so auto-compaction never fires without these.
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
        // Qwen3-Coder-Next has a 128K context window. Claude Code assumes 200K
        // for unrecognized models, so auto-compaction never fires without these.
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
        // Qwen3-Coder-Next has a 128K context window. Claude Code assumes 200K
        // for unrecognized models, so auto-compaction never fires without these.
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

/**
 * Registry mapping provider names to their region configurations.
 * Add new entries here when a provider gains regional support —
 * all region-aware code (migration, health, UI) picks it up automatically.
 */
const PROVIDER_REGION_MAPS: Record<string, Record<string, { label: string; baseUrl: string }>> = {
  "mimo-token": MIMO_TOKEN_REGIONS,
};

export function providerHasRegions(providerName: string): boolean {
  return providerName in PROVIDER_REGION_MAPS;
}

/**
 * Get the region map for a provider. Returns undefined if the provider has no regions.
 */
export function getProviderRegions(providerName: string): Record<string, { label: string; baseUrl: string }> | undefined {
  return PROVIDER_REGION_MAPS[providerName];
}

/**
 * Detect the region code from a regional provider's base URL.
 * Checks all registered provider region maps for a match.
 * Returns null if the URL doesn't match any known region pattern.
 */
export function detectRegionFromBaseUrl(baseUrl: string): string | null {
  for (const regionMap of Object.values(PROVIDER_REGION_MAPS)) {
    for (const [regionCode, config] of Object.entries(regionMap)) {
      // Match with optional trailing slash
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

/**
 * Get available provider templates
 */
export function getAvailableProviders(): ProviderTemplate[] {
  return Object.values(PROVIDER_TEMPLATES);
}

/**
 * Get a provider template by name
 */
export function getProviderTemplate(
  name: string,
): ProviderTemplate | undefined {
  return PROVIDER_TEMPLATES[name.toLowerCase()];
}

/**
 * Apply a provider template with an API key.
 * Merges common env vars (auto-update disabled, etc.) into the result.
 */
export function applyProviderTemplate(
  template: ProviderTemplate,
  apiKey: string,
): Record<string, unknown> {
  const settings = structuredClone(template.settings);
  settings.env = { ...PROVIDER_COMMON_ENV, ...settings.env };
  settings.env.ANTHROPIC_AUTH_TOKEN = apiKey;
  return settings;
}

/**
 * Match a base URL against the provider template registry.
 * Returns the provider template name, or null if unrecognized.
 */
export function getProviderByBaseUrl(baseUrl: string): string | null {
  // Provider endpoints accept a trailing slash, and users commonly add one
  // while editing settings.json. Match it like the regional URL detector does
  // so template migrations do not silently skip an otherwise known provider.
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  for (const [name, template] of Object.entries(PROVIDER_TEMPLATES)) {
    const templateUrl = template.settings.env.ANTHROPIC_BASE_URL;
    if (!templateUrl) continue;

    // mimo-token has region-dependent URLs
    if (name === "mimo-token") {
      if (normalizedBaseUrl.startsWith("https://token-plan-")) continue;
      // won't match mimo-token by exact URL since regions vary
    }

    if (normalizedBaseUrl === templateUrl) return name;
  }

  // Check mimo-token region variants — validate the region code is known
  const regionCode = detectRegionFromBaseUrl(normalizedBaseUrl);
  if (regionCode) {
    return "mimo-token";
  }

  return null;
}

/**
 * Detect which provider template an instance uses by reading its settings.json.
 * Returns the provider name (e.g. "mimo", "kimi") or null.
 */
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
 * Per-provider tunable env values that previous template versions shipped as defaults.
 * During "overwrite-legacy-defaults" sync, a tunable holding one of these values is
 * treated as stale rather than user-customized: overwritten with the current template
 * value if the template still sets the key, removed if it no longer does.
 * Update this map in the same commit as any template change to a TUNABLE_ENV_VARS value.
 */
export const LEGACY_ENV_DEFAULTS: Readonly<Record<string, Partial<Record<string, readonly string[]>>>> = {
  glm: {
    // 0.11.0 raised the output cap to match glm-5.3's 128K documented max output
    MAX_OUTPUT_TOKENS: ["64000"],
    // Pre-0.10 glm templates set a 131072 compaction window; 0.10.0 removed it because
    // one value can't fit the 1M and 200K models the template mixes
    CLAUDE_CODE_AUTO_COMPACT_WINDOW: ["131072"],
    CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: ["75"],
  },
  minimax: {
    // 0.8.0 raised MiniMax from 64K to its 512K max output
    MAX_OUTPUT_TOKENS: ["64000"],
  },
};

export type TunableEnvPolicy = "preserve-custom" | "overwrite-legacy-defaults";

export interface ProviderEnvSyncOptions {
  /** Stored provider hint; falls back to detectProvider(configDir) */
  providerTemplate?: string;
  /** Stored region hint for regional providers */
  providerRegion?: string;
  /** How to treat TUNABLE_ENV_VARS that differ from the template. Default "preserve-custom". */
  tunablePolicy?: TunableEnvPolicy;
  /** Calculate the result without writing settings.json. */
  dryRun?: boolean;
}

export type ProviderEnvSyncStatus = "synced" | "unchanged" | "skipped";

export interface ProviderEnvSyncResult {
  status: ProviderEnvSyncStatus;
  providerName: string | null;
  /** Resolved region code, regional providers only */
  region: string | null;
  reason?: "no-settings" | "unknown-provider";
}

function isLegacyDefault(providerName: string, key: string, value: string): boolean {
  return (LEGACY_ENV_DEFAULTS[providerName]?.[key] ?? []).includes(value);
}

/**
 * Sync an instance's settings.json env to its provider template.
 *
 * Model-name and structural vars always get template values; the API key is
 * preserved; user-only env vars survive. TUNABLE_ENV_VARS that differ from the
 * template are preserved ("preserve-custom") or preserved unless they hold a
 * known legacy default ("overwrite-legacy-defaults" — stale defaults from older
 * templates get refreshed, genuine customizations survive).
 *
 * Returns the sync outcome plus the resolved provider/region so callers can
 * backfill instance metadata. Throws on settings.json parse/IO errors — callers
 * decide warn-vs-throw. Writes only when content actually changes.
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

  // For regional providers, resolve the correct regional template.
  // Priority: detect from actual URL first, fall back to the stored region.
  // This ensures manually-edited URLs take precedence over stale metadata.
  let region: string | null = null;
  if (providerHasRegions(providerName)) {
    const providerRegions = getProviderRegions(providerName);
    const detectedRegion = detectRegionFromBaseUrl(existingBaseUrl ?? "") ?? options.providerRegion;
    if (detectedRegion && providerRegions && detectedRegion in providerRegions) {
      template = resolveRegionTemplate(template, detectedRegion);
      region = detectedRegion;
    }
  }

  // Build new env from template, preserve API key
  const templateSettings = structuredClone(template.settings);
  const templateEnv = templateSettings.env as Record<string, string>;
  const newEnv: Record<string, string> = { ...templateEnv, ANTHROPIC_AUTH_TOKEN: apiKey };

  // For regional providers where we couldn't resolve a valid region,
  // preserve the existing base URL to avoid silently overwriting with the default region
  if (providerHasRegions(providerName) && region === null && existingBaseUrl) {
    newEnv.ANTHROPIC_BASE_URL = existingBaseUrl;
  }

  // Preserve user-tunable env vars that the user has explicitly customized.
  // Model names and structural vars are always synced from the template,
  // but preference vars like MAX_OUTPUT_TOKENS are kept if the user set them.
  const policy = options.tunablePolicy ?? "preserve-custom";
  for (const key of TUNABLE_ENV_VARS) {
    if (!(key in existingEnv)) continue;
    const value = existingEnv[key]!;
    if (value === templateEnv[key]) continue;
    if (policy === "overwrite-legacy-defaults" && isLegacyDefault(providerName, key, value)) continue;
    newEnv[key] = value;
  }

  // Merge: template vars overwrite existing, user-only vars survive
  const merged = { ...existingEnv, ...newEnv };

  // With the legacy policy, tunables that older templates shipped as defaults but the
  // current template no longer sets (e.g. glm's auto-compaction overrides) are stale — drop them
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

/**
 * True when an instance's provider settings differ from the current template.
 * Used to catch template changes even when a release forgot to add an explicit
 * versioned migration entry.
 */
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
    // A corrupt/unreadable file is a health issue, not evidence that a provider
    // template should be applied.
    return false;
  }
}
