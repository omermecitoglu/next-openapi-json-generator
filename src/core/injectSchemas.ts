import { preserveStrings, restoreStrings } from "~/utils/string-preservation";

export default function injectSchemas(code: string, refName: string) {
  const { output: preservedCode, replacements } = preserveStrings(code);

  const preservedCodeWithSchemasInjected = preservedCode
    .replace(new RegExp(`\\b${refName}\\.`, "g"), `global.schemas[${refName}].`)
    .replace(new RegExp(`\\b${refName}\\b`, "g"), `"${refName}"`)
    .replace(new RegExp(`queryParams:\\s*['"\`]${refName}['"\`]`, "g"), `queryParams: global.schemas["${refName}"]`)
    .replace(new RegExp(`pathParams:\\s*['"\`]${refName}['"\`]`, "g"), `pathParams: global.schemas["${refName}"]`);

  return restoreStrings(preservedCodeWithSchemasInjected, replacements);
}
