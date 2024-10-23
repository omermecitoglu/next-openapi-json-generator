import { defineConfig } from "tsup";

export default defineConfig({
  outDir: "dist",
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  clean: true,
  external: [
  ],
  noExternal: [
    "zod-to-json-schema",
    "@omer-x/package-metadata",
  ],
  esbuildPlugins: [
  ],
  esbuildOptions(options) {
    options.logOverride = {
      "direct-eval": "silent",
    };
  },
});
