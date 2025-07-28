import removeImports from "~/utils/removeImports";
import type ts from "typescript";

function fixExportsInCommonJS(code: string) {
  const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const exportFixer1 = validMethods.map(method => `exports.${method} = void 0;\n`).join("\n");
  const exportFixer2 = `module.exports = { ${validMethods.map(m => `${m}: exports.${m}`).join(", ")} };`;
  return `${exportFixer1}\n${code}\n${exportFixer2}`;
}

function injectMiddlewareFixer(middlewareName: string) {
  return `const ${middlewareName} = (handler) => handler;`;
}

export function transpile(
  isCommonJS: boolean,
  rawCode: string,
  middlewareName: string | null,
  transpileModule: (input: string, transpileOptions: ts.TranspileOptions) => ts.TranspileOutput,
) {
  const parts = [
    middlewareName ? injectMiddlewareFixer(middlewareName) : "",
    removeImports(rawCode),
  ];
  const output = transpileModule(parts.join("\n"), {
    compilerOptions: {
      module: isCommonJS ? 3 : 99,
      target: 99,
      sourceMap: false,
      inlineSourceMap: false,
      inlineSources: false,
    },
  });
  if (isCommonJS) {
    return fixExportsInCommonJS(output.outputText);
  }
  return output.outputText;
}
