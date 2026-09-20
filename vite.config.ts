import { defineConfig } from "vite-plus";

// Lint configuration ported from .oxlintrc.json (removed after the Vite+ migration).
// `vp lint` / `vp check` read Oxlint settings from the `lint` block below.
export default defineConfig({
  // Formatting runs with Oxfmt defaults (Prettier-compatible); the empty
  // block records that intent and silences vp's "no config found" advisory.
  fmt: {},
  lint: {
    plugins: ["typescript", "unicorn", "oxc", "react", "import"],
    categories: {
      correctness: "error",
      suspicious: "warn",
    },
    rules: {
      "no-unused-vars": "warn",
      "require-await": "warn",
      "no-shadow": "warn",
      "no-underscore-dangle": "off",
      "react/exhaustive-deps": "error",
    },
    settings: {
      react: {
        version: "19.0",
      },
    },
    ignorePatterns: ["dist", "bin", "node_modules"],
    overrides: [
      {
        files: ["test/**", "*.test.ts", "*.test.tsx"],
        rules: {
          "no-unused-vars": "off",
          "require-await": "off",
        },
      },
      {
        files: ["scripts/**"],
        rules: {
          "no-control-regex": "off",
        },
      },
      {
        // react/set-state-in-effect is new in the oxlint bundled with Vite+
        // (1.83). The hooks in src/ink/hooks intentionally call setState
        // synchronously inside effects: capture/test-mode fast paths that skip
        // animations (useTypewriter & co.) and mount-time data fetches
        // (useConfig.reload, useHealthCheck.runChecks). Rewriting these to
        // derived-state patterns risks behavior changes in the Ink TUI, so the
        // rule is scoped off here; it stays active everywhere else.
        files: ["src/ink/hooks/**"],
        rules: {
          "react/set-state-in-effect": "off",
        },
      },
    ],
    env: {
      builtin: true,
    },
  },
});
