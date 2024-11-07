function generateRandomString(length: number) {
  return [...Array(length)].map(() => Math.random().toString(36)[2]).join("");
}

function preserveStrings(code: string) {
  let replacements = {} as Record<string, string>;

  const output = code.replace(/(['"`])([^'`"]+)\1/g, replacedString => {
    const replacementId = generateRandomString(32);
    replacements = {
      ...replacements,
      [replacementId]: replacedString,
    };
    return `<@~${replacementId}~@>`;
  });
  return { output, replacements };
}

function restoreStrings(code: string, replacements: Record<string, string>) {
  return code.replace(/<@~(.*?)~@>/g, (_, replacementId) => {
    return replacements[replacementId];
  });
}

export default function injectSchemas(code: string, refName: string) {
  const { output: preservedCode, replacements } = preserveStrings(code);

  const preservedCodeWithSchemasInjected = preservedCode
    .replace(new RegExp(`\\b${refName}\\.`, "g"), `global.schemas[${refName}].`)
    .replace(new RegExp(`\\b${refName}\\b`, "g"), `"${refName}"`);

  return restoreStrings(preservedCodeWithSchemasInjected, replacements);
}
