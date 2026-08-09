import { transform } from "sucrase";
import removeImports from "~/utils/removeImports";

function fixExportsInCommonJS(code: string): string {
  const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const exportFixer1 = validMethods.map(method => `exports.${method} = void 0;\n`).join("\n");
  const exportFixer2 = `module.exports = { ${validMethods.map(m => `${m}: exports.${m}`).join(", ")} };`;
  return `${exportFixer1}\n${code}\n${exportFixer2}`;
}

function injectMiddlewareFixer(middlewareName: string): string {
  return `const ${middlewareName} = (handler) => handler;`;
}

export function transpile(rawCode: string, middlewareName: string | null): string {
  const parts = [
    middlewareName ? injectMiddlewareFixer(middlewareName) : "",
    removeImports(rawCode),
  ];
  const { code } = transform(parts.join("\n"), {
    transforms: ["typescript", "imports"],
    disableESTransforms: true,
  });
  return fixExportsInCommonJS(code);
}
