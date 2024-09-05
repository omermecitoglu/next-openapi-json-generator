/* eslint-disable no-console */

export function verifyOptions(include: string[], exclude: string[]) {
  if (process.env.NODE_ENV === "development") {
    for (const item of include) {
      if (!item.endsWith("/route.ts")) {
        console.log(`${item} is not a valid route handler path`);
      }
    }
    for (const item of exclude) {
      if (!item.endsWith("/route.ts")) {
        console.log(`${item} is not a valid route handler path`);
      }
    }
  }
  return {
    include: include.filter(item => item.endsWith("/route.ts")),
    exclude: exclude.filter(item => item.endsWith("/route.ts")),
  };
}
