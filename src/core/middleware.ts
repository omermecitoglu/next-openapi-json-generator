export function detectMiddlewareName(code: string): string | null {
  const match = code.match(/middleware:\s*(\w+)/);
  return match ? match[1] : null;
}
