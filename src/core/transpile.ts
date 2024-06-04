import { transpile as tsTranspile } from "typescript";

function removeImports(code: string) {
  return code.replace(/^import\s.+\sfrom\s.+;$/gm, "").trim();
}

function fixExports(code: string) {
  const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const exportFixer1 = validMethods.map(method => `exports.${method} = void 0;\n`);
  const exportFixer2 = `module.exports = { ${validMethods.map(m => `${m}: exports.${m}`).join(", ")} }`;
  return `${exportFixer1}\n${code}\n${exportFixer2}`;
}

export function transpile(rawCode: string) {
  const code = fixExports(removeImports(rawCode));
  const parts = [
    "import createRoute from '@omer-x/next-openapi-route-handler'",
    "import z from 'zod';",
    code,
  ];
  return tsTranspile(parts.join("\n"));
}
