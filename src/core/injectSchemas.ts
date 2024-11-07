export default function injectSchemas(code: string, refName: string) {
  return code
    .replace(new RegExp(`\\b${refName}\\.`, "g"), `global.schemas[${refName}].`)
    .replace(new RegExp(`\\b${refName}\\b`, "g"), `"${refName}"`);
}
