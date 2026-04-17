import { defineConfig } from "tsup";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  banner: { js: "#!/usr/bin/env node" },
  clean: true,
  esbuildOptions(options) {
    options.define = {
      ...options.define,
      "PKG_VERSION": JSON.stringify(pkg.version),
    };
  },
});
