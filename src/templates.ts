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
 * To reactivate: add DISABLE_AUTOUPDATER: "1" and DISABLE_UPDATES: "1"
 * if a future Claude Code version breaks 3rd-party provider compatibility.
 * See: src/version.ts → isThirdPartyApiBroken()
 */
const PROVIDER_COMMON_ENV: Record<string, string> = {};

const PROVIDER_TEMPLATES: Record<string, ProviderTemplate> = {
  glm: {
    name: "glm",
    displayName: "GLM Coding Plan",
    description: "GLM-5.1 and GLM-5-Turbo via z.ai Coding Plan subscription (Anthropic endpoint is coding-plan-only)",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://api.z.ai/api/anthropic",
        API_TIMEOUT_MS: "3000000",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "glm-5-turbo",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "glm-5-turbo",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "glm-5.1",
        ANTHROPIC_MODEL: "glm-5.1",
        ANTHROPIC_SMALL_FAST_MODEL: "glm-5-turbo",
        ENABLE_THINKING: "true",
        REASONING_EFFORT: "high",
        MAX_THINKING_TOKENS: "8000",
        ENABLE_STREAMING: "true",
        MAX_OUTPUT_TOKENS: "64000",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: false,
    },
  },
  minimax: {
    name: "minimax",
    displayName: "MiniMax",
    description: "MiniMax-M2.7 model via minimax.io",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://api.minimax.io/anthropic",
        API_TIMEOUT_MS: "3000000",
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
        ANTHROPIC_MODEL: "MiniMax-M2.7",
        ANTHROPIC_SMALL_FAST_MODEL: "MiniMax-M2.7",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "MiniMax-M2.7",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "MiniMax-M2.7",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "MiniMax-M2.7",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: true,
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
        ANTHROPIC_MODEL: "mimo-v2.5-pro",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "mimo-v2.5-pro",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "mimo-v2.5-pro",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "mimo-v2.5",
        ANTHROPIC_SMALL_FAST_MODEL: "mimo-v2.5",
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
        ANTHROPIC_MODEL: "mimo-v2.5-pro",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "mimo-v2.5-pro",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "mimo-v2.5-pro",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "mimo-v2.5",
        ANTHROPIC_SMALL_FAST_MODEL: "mimo-v2.5",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: false,
    },
  },
  kimi: {
    name: "kimi",
    displayName: "Moonshot Kimi",
    description: "Kimi K2.6 and K2.5 models via moonshot.ai — pay-per-token only, no subscription plan",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://api.moonshot.ai/anthropic",
        API_TIMEOUT_MS: "3000000",
        ANTHROPIC_MODEL: "kimi-k2.6",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "kimi-k2.6",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "kimi-k2.5",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "kimi-k2.5",
        ANTHROPIC_SMALL_FAST_MODEL: "kimi-k2.5",
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

export function providerHasRegions(providerName: string): boolean {
  return providerName === "mimo-token";
}

export function resolveRegionTemplate(
  template: ProviderTemplate,
  region: string,
): ProviderTemplate {
  if (!providerHasRegions(template.name)) {
    return template;
  }

  const regionConfig = MIMO_TOKEN_REGIONS[region];
  if (!regionConfig) {
    throw new Error(
      `Unknown region '${region}' for ${template.name}. Available: ${Object.keys(MIMO_TOKEN_REGIONS).join(", ")}`,
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

