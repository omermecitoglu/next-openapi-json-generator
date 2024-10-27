/* export function pick<T extends object, K extends keyof T>(object: T, ...keys: K[]) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => keys.includes(key as K))) as Pick<T, K>;
} */

export function omit<T extends object, K extends keyof T>(object: T, ...keys: K[]) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key as K))) as Omit<T, K>;
}

/* export function pluck<T, K extends keyof T>(collection: T[], key: K) {
  return collection.map(item => item[key]) as T[K][];
} */
