import { defineConfig } from "tsup";

export default defineConfig({
  outDir: "dist",
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  clean: true,
  external: [
  ],
  esbuildPlugins: [
  ],
  esbuildOptions(options) {
    options.logOverride = {
      "direct-eval": "silent",
    };
  },
});
