export default function removeImports(code: string) {
  return code
    .replace(/(^import\s+[^;]+;?$|^import\s+[^;]*\sfrom\s.+;?$)/gm, "") // matches single-line imports and side-effect imports
    .replace(/(^import\s+{[\s\S]+?}\s+from\s+["'][^"']+["'];?)/gm, "") // matches multiline named imports
    .trim();
}
