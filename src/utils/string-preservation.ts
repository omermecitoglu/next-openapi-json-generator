export function preserveStrings(code: string) {
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

export function restoreStrings(code: string, replacements: Record<string, string>) {
  return code.replace(/<@~(.*?)~@>/g, (_, replacementId) => {
    return replacements[replacementId];
  });
}

function generateRandomString(length: number) {
  return [...Array(length)].map(() => Math.random().toString(36)[2]).join("");
}
