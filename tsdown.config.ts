import { defineConfig } from "tsdown";

export default defineConfig({
  outDir: "dist",
  entry: ["src/index.ts"],
  fixedExtension: false,
});
