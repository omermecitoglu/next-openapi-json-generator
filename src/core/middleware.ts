export function detectMiddlewareName(code: string) {
  const match = code.match(/middleware:\s*(\w+)/);
  return match ? match[1] : null;
}
