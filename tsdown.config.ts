import { defineConfig } from "tsdown";

export default defineConfig({
  outDir: "dist",
  entry: ["src/index.ts"],
  fixedExtension: false,
  deps: {
    alwaysBundle: ["@omer/object"],
    onlyBundle: ["@omer/object"],
  },
});
