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

export const PROVIDER_TEMPLATES: Record<string, ProviderTemplate> = {
  glm: {
    name: "glm",
    displayName: "GLM (智谱AI)",
    description: "GLM-4.5 and GLM-4.6 models via z.ai",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://api.z.ai/api/anthropic",
        API_TIMEOUT_MS: "3000000",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "glm-4.5-air",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "glm-4.6",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "glm-4.6",
        ANTHROPIC_MODEL: "glm-4.6",
        ANTHROPIC_SMALL_FAST_MODEL: "glm-4.6-air",
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
    description: "MiniMax-M2 model via minimax.io",
    settings: {
      env: {
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_BASE_URL: "https://api.minimax.io/anthropic",
        API_TIMEOUT_MS: "3000000",
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
        ANTHROPIC_MODEL: "MiniMax-M2",
        ANTHROPIC_SMALL_FAST_MODEL: "MiniMax-M2",
        ANTHROPIC_DEFAULT_SONNET_MODEL: "MiniMax-M2",
        ANTHROPIC_DEFAULT_OPUS_MODEL: "MiniMax-M2",
        ANTHROPIC_DEFAULT_HAIKU_MODEL: "MiniMax-M2",
      },
      includeCoAuthoredBy: false,
      alwaysThinkingEnabled: true,
    },
  },
};

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
 * Apply a provider template with an API key
 */
export function applyProviderTemplate(
  template: ProviderTemplate,
  apiKey: string,
): Record<string, unknown> {
  const settings = JSON.parse(JSON.stringify(template.settings));
  settings.env.ANTHROPIC_AUTH_TOKEN = apiKey;
  return settings;
}

/**
 * Check if a provider template exists
 */
export function hasProviderTemplate(name: string): boolean {
  return name.toLowerCase() in PROVIDER_TEMPLATES;
}
