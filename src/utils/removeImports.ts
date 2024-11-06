export default function removeImports(code: string) {
  return code.replace(/^import\s.+\sfrom\s.+;?$/gm, "").trim();
}
