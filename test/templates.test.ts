import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getProviderByBaseUrl, getProviderTemplate, detectProvider, detectRegionFromBaseUrl, LEGACY_ENV_DEFAULTS } from "@/templates";

let testDir: string;

describe("Provider detection", () => {
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "provider-detect-"));
  });

  afterEach(() => {
    try { rmSync(testDir, { recursive: true, force: true }); } catch {}
  });

  describe("getProviderByBaseUrl", () => {
    test("detects GLM by base URL", () => {
      expect(getProviderByBaseUrl("https://api.z.ai/api/anthropic")).toBe("glm");
    });

    test("detects GLM by base URL with a trailing slash", () => {
      expect(getProviderByBaseUrl("https://api.z.ai/api/anthropic/")).toBe("glm");
    });

    test("GLM template pins the GLM-5.3 three-tier model mapping", () => {
      const env = getProviderTemplate("glm")!.settings.env;
      expect(env.ANTHROPIC_MODEL).toBe("glm-5.3[1m]");
      expect(env.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe("glm-5.3[1m]");
      expect(env.ANTHROPIC_DEFAULT_SONNET_MODEL).toBe("glm-5.3-flash[1m]");
      expect(env.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBe("glm-5-turbo");
      expect(env.ANTHROPIC_SMALL_FAST_MODEL).toBe("glm-5-turbo");
      expect(env.MAX_OUTPUT_TOKENS).toBe("128000");
    });

    test("LEGACY_ENV_DEFAULTS pins the stale defaults the migrations upgrade", () => {
      expect(LEGACY_ENV_DEFAULTS.glm?.MAX_OUTPUT_TOKENS).toContain("64000");
      expect(LEGACY_ENV_DEFAULTS.glm?.CLAUDE_CODE_AUTO_COMPACT_WINDOW).toContain("131072");
      expect(LEGACY_ENV_DEFAULTS.glm?.CLAUDE_AUTOCOMPACT_PCT_OVERRIDE).toContain("75");
      expect(LEGACY_ENV_DEFAULTS.minimax?.MAX_OUTPUT_TOKENS).toContain("64000");
    });

    test("detects MiniMax by base URL", () => {
      expect(getProviderByBaseUrl("https://api.minimax.io/anthropic")).toBe("minimax");
    });

    test("detects DeepSeek by base URL", () => {
      expect(getProviderByBaseUrl("https://api.deepseek.com/anthropic")).toBe("deepseek");
    });

    test("detects MiMo by base URL", () => {
      expect(getProviderByBaseUrl("https://api.xiaomimimo.com/anthropic")).toBe("mimo");
    });

    test("detects MiMo Token Plan CN region", () => {
      expect(getProviderByBaseUrl("https://token-plan-cn.xiaomimimo.com/anthropic")).toBe("mimo-token");
    });

    test("detects MiMo Token Plan SGP region", () => {
      expect(getProviderByBaseUrl("https://token-plan-sgp.xiaomimimo.com/anthropic")).toBe("mimo-token");
    });

    test("detects MiMo Token Plan AMS region", () => {
      expect(getProviderByBaseUrl("https://token-plan-ams.xiaomimimo.com/anthropic")).toBe("mimo-token");
    });

    test("detects Kimi by base URL", () => {
      expect(getProviderByBaseUrl("https://api.moonshot.ai/anthropic")).toBe("kimi");
    });

    test("detects Qwen by base URL", () => {
      expect(getProviderByBaseUrl("https://dashscope-intl.aliyuncs.com/apps/anthropic")).toBe("qwen");
    });

    test("detects Qwen Coding Plan by base URL", () => {
      expect(getProviderByBaseUrl("https://coding-intl.dashscope.aliyuncs.com/apps/anthropic")).toBe("qwen-coding");
    });

    test("returns null for unrecognized URL", () => {
      expect(getProviderByBaseUrl("https://api.unknown.com/anthropic")).toBeNull();
    });

    test("returns null for empty string", () => {
      expect(getProviderByBaseUrl("")).toBeNull();
    });
  });

  describe("detectProvider", () => {
    test("detects provider from instance settings.json", () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_AUTH_TOKEN: "sk-test",
          ANTHROPIC_BASE_URL: "https://api.xiaomimimo.com/anthropic",
          ANTHROPIC_MODEL: "mimo-v2.5-pro",
        },
      }));

      expect(detectProvider(testDir)).toBe("mimo");
    });

    test("returns null when settings.json does not exist", () => {
      expect(detectProvider(join(testDir, "nonexistent"))).toBeNull();
    });

    test("returns null when settings.json has no env", () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, "settings.json"), JSON.stringify({}));

      expect(detectProvider(testDir)).toBeNull();
    });

    test("returns null when env has no ANTHROPIC_BASE_URL", () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, "settings.json"), JSON.stringify({
        env: { ANTHROPIC_AUTH_TOKEN: "sk-test" },
      }));

      expect(detectProvider(testDir)).toBeNull();
    });

    test("returns null for unrecognized base URL", () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, "settings.json"), JSON.stringify({
        env: {
          ANTHROPIC_BASE_URL: "https://custom.api.com/anthropic",
        },
      }));

      expect(detectProvider(testDir)).toBeNull();
    });

    test("returns null for corrupted settings.json", () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, "settings.json"), "not json");

      expect(detectProvider(testDir)).toBeNull();
    });
  });

  describe("detectRegionFromBaseUrl", () => {
    test("detects cn region", () => {
      expect(detectRegionFromBaseUrl("https://token-plan-cn.xiaomimimo.com/anthropic")).toBe("cn");
    });

    test("detects sgp region", () => {
      expect(detectRegionFromBaseUrl("https://token-plan-sgp.xiaomimimo.com/anthropic")).toBe("sgp");
    });

    test("detects ams region", () => {
      expect(detectRegionFromBaseUrl("https://token-plan-ams.xiaomimimo.com/anthropic")).toBe("ams");
    });

    test("handles trailing slash", () => {
      expect(detectRegionFromBaseUrl("https://token-plan-sgp.xiaomimimo.com/anthropic/")).toBe("sgp");
    });

    test("returns null for unknown region code", () => {
      expect(detectRegionFromBaseUrl("https://token-plan-evil.xiaomimimo.com/anthropic")).toBeNull();
    });

    test("returns null for non-mimo-token URL", () => {
      expect(detectRegionFromBaseUrl("https://api.xiaomimimo.com/anthropic")).toBeNull();
    });

    test("returns null for empty string", () => {
      expect(detectRegionFromBaseUrl("")).toBeNull();
    });

    test("returns null for similar but wrong domain", () => {
      expect(detectRegionFromBaseUrl("https://token-plan-sgp.other.com/anthropic")).toBeNull();
    });
  });
});
