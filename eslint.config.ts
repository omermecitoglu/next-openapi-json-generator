import omer from "@omer-x/eslint-config";
import plugin from "@typescript-eslint/eslint-plugin";

export default [
  ...omer,
  {
    plugins: {
      "@typescript-eslint": plugin,
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
  {
    ignores: ["dist/*"],
  },
];
