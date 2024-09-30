export default function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a !== typeof b) return false;
  switch (typeof a) {
    case "object": {
      if (!a || !b) return a === b;
      if (Array.isArray(a) && Array.isArray(b)) {
        return a.every((item, index) => deepEqual(item, b[index]));
      }
      return Object.entries(a).every(([key, value]) => deepEqual(value, (b as Record<string, unknown>)[key]));
    }
    case "function":
    case "symbol":
      return false;
    default:
      return a === b;
  }
}
