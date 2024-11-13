import generateRandomString from "./generateRandomString";

export function preserveStrings(code: string) {
  let replacements = {} as Record<string, string>;

  const output = code.replace(/(['"`])((?:\\.|(?!\1).)*)\1/g, (match, quote, content) => {
    const replacementId = generateRandomString(32);
    replacements = {
      ...replacements,
      [replacementId]: `${quote}${content}${quote}`,
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
