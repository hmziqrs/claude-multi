import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Instance } from "@/config";
import {
  detectProvider,
  getProviderTemplate,
  providerHasRegions,
  resolveRegionTemplate,
  detectRegionFromBaseUrl,
  getProviderRegions,
} from "@/templates";
import { generateWrapperScriptSafe } from "@/wrapper";
import { TUNABLE_ENV_VARS } from "@/constants/env";

export type TemplateMismatchStatus = "match" | "mismatch" | "unknown";
export type WrapperMismatchStatus = "match" | "mismatch" | "missing" | "unknown";

export interface TemplateDiagnostic {
  status: TemplateMismatchStatus;
  providerName: string | null;
}

export interface WrapperDiagnostic {
  status: WrapperMismatchStatus;
}

/**
 * Safely resolve a regional template. Returns null if the region is invalid
 * or if resolveRegionTemplate would throw.
 */
function tryResolveRegionalTemplate(
  template: ReturnType<typeof getProviderTemplate>,
  region: string,
): ReturnType<typeof getProviderTemplate> {
  if (!template) return undefined;
  try {
    const providerRegions = getProviderRegions(template.name);
    if (providerRegions && region in providerRegions) {
      return resolveRegionTemplate(template, region);
    }
  } catch {
    // Invalid region — fall through
  }
  return undefined;
}

/**
 * Check whether an instance's settings.json env vars match the
 * expected provider template. Compares all structural template vars
 * (model names, base URL) but excludes the API key and tunable preference vars.
 */
export function detectTemplateMismatch(instance: Instance): TemplateDiagnostic {
  const providerName = instance.providerTemplate ?? detectProvider(instance.configDir);
  if (!providerName) {
    return { status: "unknown", providerName: null };
  }

  let template = getProviderTemplate(providerName);
  if (!template) {
    return { status: "unknown", providerName };
  }

  // Read settings.json once — used for both regional resolution and comparison
  const settingsFile = join(instance.configDir, "settings.json");
  if (!existsSync(settingsFile)) {
    return { status: "unknown", providerName };
  }

  let existingEnv: Record<string, string> = {};
  try {
    const raw = JSON.parse(readFileSync(settingsFile, "utf-8")) as Record<string, unknown>;
    existingEnv = (raw.env as Record<string, string>) ?? {};
  } catch {
    return { status: "unknown", providerName };
  }

  // Resolve regional template if applicable
  if (providerHasRegions(providerName)) {
    const existingUrl = existingEnv.ANTHROPIC_BASE_URL;
    const detectedRegion = existingUrl
      ? detectRegionFromBaseUrl(existingUrl) ?? instance.providerRegion
      : instance.providerRegion;

    if (detectedRegion) {
      const resolved = tryResolveRegionalTemplate(template, detectedRegion);
      if (resolved) {
        template = resolved;
      }
    }
  }

  // Compare template env vars excluding API key and tunable vars
  const templateEnv = template.settings.env;
  for (const [key, expectedValue] of Object.entries(templateEnv)) {
    if (key === "ANTHROPIC_AUTH_TOKEN") continue;
    if (TUNABLE_ENV_VARS.has(key)) continue;
    if (existingEnv[key] !== expectedValue) {
      return { status: "mismatch", providerName };
    }
  }

  return { status: "match", providerName };
}

/**
 * Check whether an instance's wrapper script matches the expected
 * standard template (correct claude binary path, correct config dir).
 */
export function detectWrapperMismatch(instance: Instance): WrapperDiagnostic {
  if (!existsSync(instance.binaryPath)) {
    return { status: "missing" };
  }

  const expected = generateWrapperScriptSafe({
    name: instance.name,
    configDir: instance.configDir,
    binaryPath: instance.binaryPath,
  });

  if (expected === null) {
    return { status: "unknown" };
  }

  try {
    const current = readFileSync(instance.binaryPath, "utf-8");
    return current === expected ? { status: "match" } : { status: "mismatch" };
  } catch {
    return { status: "unknown" };
  }
}
