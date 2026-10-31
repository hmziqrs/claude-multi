import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  getProviderByBaseUrl,
  getProviderTemplate,
  detectProvider,
  detectRegionFromBaseUrl,
  LEGACY_ENV_DEFAULTS,
} from "@/templates";

let testDir: string;

describe("Provider detection", () => {
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "provider-detect-"));
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {}
  });

  describe("getProviderByBaseUrl", () => {
    test("detects GLM by base URL", () => {
      expect(getProviderByBaseUrl("https://api.z.ai/api/anthropic")).toBe("glm");
    });

    test("detects GLM by base URL with a trailing slash", () => {
      expect(getProviderByBaseUrl("https://api.z.ai/api/anthropic/")).toBe("glm");
    });

    test("GLM template uses GLM-5.3 for main work and Flash for background", () => {
      const env = getProviderTemplate("glm")!.settings.env;
      expect(env.ANTHROPIC_MODEL).toBe("glm-5.3[1m]");
      expect(env.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe("glm-5.3[1m]");
      expect(env.ANTHROPIC_DEFAULT_SONNET_MODEL).toBe("glm-5.3[1m]");
      expect(env.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBe("glm-5.3-flash[1m]");
      expect(env.CLAUDE_CODE_AUTO_COMPACT_WINDOW).toBe("1000000");
      expect(env.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe("128000");
      expect(env.CLAUDE_CODE_EFFORT_LEVEL).toBe("high");
      expect(env.MAX_OUTPUT_TOKENS).toBeUndefined();
      expect(env.ANTHROPIC_SMALL_FAST_MODEL).toBeUndefined();
    });

    test("MiniMax template uses M3.1 Flash in every slot", () => {
      const env = getProviderTemplate("minimax")!.settings.env;
      for (const key of [
        "ANTHROPIC_MODEL",
        "ANTHROPIC_DEFAULT_OPUS_MODEL",
        "ANTHROPIC_DEFAULT_SONNET_MODEL",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL",
        "CLAUDE_CODE_SUBAGENT_MODEL",
      ]) {
        expect(env[key]).toBe("MiniMax-M3.1-Flash[1m]");
      }
      expect(env.CLAUDE_CODE_AUTO_COMPACT_WINDOW).toBe("524288");
      expect(env.CLAUDE_CODE_EFFORT_LEVEL).toBe("max");
      expect(env.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe("128000");
      expect(env.MAX_OUTPUT_TOKENS).toBeUndefined();
    });

    test("DeepSeek template uses V4.1 Flash as the default", () => {
      const env = getProviderTemplate("deepseek")!.settings.env;
      expect(env.ANTHROPIC_MODEL).toBe("deepseek-flash[1m]");
      expect(env.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe("deepseek-flash[1m]");
      expect(env.ANTHROPIC_DEFAULT_SONNET_MODEL).toBe("deepseek-flash[1m]");
      expect(env.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBe("deepseek-flash");
      expect(env.CLAUDE_CODE_SUBAGENT_MODEL).toBe("deepseek-flash");
      expect(env.CLAUDE_CODE_AUTO_COMPACT_WINDOW).toBe("786432");
      expect(env.CLAUDE_CODE_EFFORT_LEVEL).toBe("max");
      expect(env.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe("128000");
      expect(env.MAX_OUTPUT_TOKENS).toBeUndefined();
    });

    test("MiMo templates use the V2.6 Pro and Flash models", () => {
      for (const name of ["mimo", "mimo-token"]) {
        const env = getProviderTemplate(name)!.settings.env;
        expect(env.ANTHROPIC_MODEL).toBe("mimo-v2.6-pro[1m]");
        expect(env.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe("mimo-v2.6-pro[1m]");
        expect(env.ANTHROPIC_DEFAULT_SONNET_MODEL).toBe("mimo-v2.6-pro[1m]");
        expect(env.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBe("mimo-v2.6-flash[1m]");
        expect(env.CLAUDE_CODE_SUBAGENT_MODEL).toBe("mimo-v2.6-flash[1m]");
        expect(env.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe("128000");
        expect(env.MAX_OUTPUT_TOKENS).toBeUndefined();
      }
    });

    test("Kimi template uses K3.1 Pro at standard speed for every slot", () => {
      const env = getProviderTemplate("kimi")!.settings.env;
      for (const key of [
        "ANTHROPIC_MODEL",
        "ANTHROPIC_DEFAULT_OPUS_MODEL",
        "ANTHROPIC_DEFAULT_SONNET_MODEL",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL",
        "CLAUDE_CODE_SUBAGENT_MODEL",
      ]) {
        expect(env[key]).toBe("kimi-k3.1-pro[1m]");
      }
      expect(env.CLAUDE_CODE_AUTO_COMPACT_WINDOW).toBe("1000000");
      expect(env.CLAUDE_CODE_EFFORT_LEVEL).toBe("max");
      expect(env.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe("128000");
      expect(env.MAX_OUTPUT_TOKENS).toBeUndefined();
    });

    test("Qwen templates use the current 3.8 and 3.7 models", () => {
      const env = getProviderTemplate("qwen")!.settings.env;
      expect(env.ANTHROPIC_MODEL).toBe("qwen3.8-max");
      expect(env.ANTHROPIC_DEFAULT_OPUS_MODEL).toBe("qwen3.8-max");
      expect(env.ANTHROPIC_DEFAULT_SONNET_MODEL).toBe("qwen3.7-plus");
      expect(env.ANTHROPIC_DEFAULT_HAIKU_MODEL).toBe("qwen3.8-flash");
      expect(env.CLAUDE_CODE_SUBAGENT_MODEL).toBe("qwen3.8-flash");
      expect(env.CLAUDE_CODE_MAX_CONTEXT_TOKENS).toBe("983616");
      expect(env.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe("128000");
      expect(env.CLAUDE_CODE_AUTO_COMPACT_WINDOW).toBeUndefined();

      const coding = getProviderTemplate("qwen-coding")!.settings.env;
      for (const key of [
        "ANTHROPIC_MODEL",
        "ANTHROPIC_DEFAULT_OPUS_MODEL",
        "ANTHROPIC_DEFAULT_SONNET_MODEL",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL",
        "CLAUDE_CODE_SUBAGENT_MODEL",
      ]) {
        expect(coding[key]).toBe("qwen3.7-plus");
      }
      expect(coding.CLAUDE_CODE_MAX_CONTEXT_TOKENS).toBe("983616");
      expect(coding.CLAUDE_CODE_MAX_OUTPUT_TOKENS).toBe("128000");
    });

    test("LEGACY_ENV_DEFAULTS pins the stale defaults the migrations upgrade", () => {
      expect(LEGACY_ENV_DEFAULTS.glm?.MAX_OUTPUT_TOKENS).toContain("64000");
      expect(LEGACY_ENV_DEFAULTS.glm?.CLAUDE_CODE_AUTO_COMPACT_WINDOW).toContain("131072");
      expect(LEGACY_ENV_DEFAULTS.glm?.CLAUDE_AUTOCOMPACT_PCT_OVERRIDE).toContain("75");
      expect(LEGACY_ENV_DEFAULTS.minimax?.MAX_OUTPUT_TOKENS).toContain("64000");
      expect(LEGACY_ENV_DEFAULTS.minimax?.MAX_OUTPUT_TOKENS).toContain("512000");
      expect(LEGACY_ENV_DEFAULTS.deepseek?.MAX_OUTPUT_TOKENS).toContain("128000");
      expect(LEGACY_ENV_DEFAULTS.deepseek?.MAX_OUTPUT_TOKENS).toContain("384000");
      expect(LEGACY_ENV_DEFAULTS.kimi?.MAX_OUTPUT_TOKENS).toContain("65536");
      expect(LEGACY_ENV_DEFAULTS.kimi?.CLAUDE_CODE_AUTO_COMPACT_WINDOW).toContain("262144");
      expect(LEGACY_ENV_DEFAULTS.qwen?.CLAUDE_CODE_AUTO_COMPACT_WINDOW).toContain("131072");
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
      expect(getProviderByBaseUrl("https://token-plan-cn.xiaomimimo.com/anthropic")).toBe(
        "mimo-token",
      );
    });

    test("detects MiMo Token Plan SGP region", () => {
      expect(getProviderByBaseUrl("https://token-plan-sgp.xiaomimimo.com/anthropic")).toBe(
        "mimo-token",
      );
    });

    test("detects MiMo Token Plan AMS region", () => {
      expect(getProviderByBaseUrl("https://token-plan-ams.xiaomimimo.com/anthropic")).toBe(
        "mimo-token",
      );
    });

    test("detects Kimi by base URL", () => {
      expect(getProviderByBaseUrl("https://api.moonshot.ai/anthropic")).toBe("kimi");
    });

    test("detects Qwen by base URL", () => {
      expect(getProviderByBaseUrl("https://dashscope-intl.aliyuncs.com/apps/anthropic")).toBe(
        "qwen",
      );
    });

    test("detects Qwen Coding Plan by base URL", () => {
      expect(
        getProviderByBaseUrl("https://coding-intl.dashscope.aliyuncs.com/apps/anthropic"),
      ).toBe("qwen-coding");
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
      writeFileSync(
        join(testDir, "settings.json"),
        JSON.stringify({
          env: {
            ANTHROPIC_AUTH_TOKEN: "sk-test",
            ANTHROPIC_BASE_URL: "https://api.xiaomimimo.com/anthropic",
            ANTHROPIC_MODEL: "mimo-v2.6-pro",
          },
        }),
      );

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
      writeFileSync(
        join(testDir, "settings.json"),
        JSON.stringify({
          env: { ANTHROPIC_AUTH_TOKEN: "sk-test" },
        }),
      );

      expect(detectProvider(testDir)).toBeNull();
    });

    test("returns null for unrecognized base URL", () => {
      mkdirSync(testDir, { recursive: true });
      writeFileSync(
        join(testDir, "settings.json"),
        JSON.stringify({
          env: {
            ANTHROPIC_BASE_URL: "https://custom.api.com/anthropic",
          },
        }),
      );

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
      expect(detectRegionFromBaseUrl("https://token-plan-sgp.xiaomimimo.com/anthropic")).toBe(
        "sgp",
      );
    });

    test("detects ams region", () => {
      expect(detectRegionFromBaseUrl("https://token-plan-ams.xiaomimimo.com/anthropic")).toBe(
        "ams",
      );
    });

    test("handles trailing slash", () => {
      expect(detectRegionFromBaseUrl("https://token-plan-sgp.xiaomimimo.com/anthropic/")).toBe(
        "sgp",
      );
    });

    test("returns null for unknown region code", () => {
      expect(
        detectRegionFromBaseUrl("https://token-plan-evil.xiaomimimo.com/anthropic"),
      ).toBeNull();
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
