import fs from "node:fs/promises";
import path from "node:path";
import { directoryExists } from "./dir";
import { transpile } from "./transpile";
import type { OperationObject } from "@omer-x/openapi-types/operation";

export async function findAppFolderPath() {
  const inSrc = path.resolve(process.cwd(), "src", "app");
  if (await directoryExists(inSrc)) {
    return inSrc;
  }
  const inRoot = path.resolve(process.cwd(), "app");
  if (await directoryExists(inRoot)) {
    return inRoot;
  }
  return null;
}

function injectSchemas(code: string, refName: string) {
  return code
    .replace(new RegExp(`\\b${refName}\\.`, "g"), `global.schemas[${refName}].`)
    .replace(new RegExp(`\\b${refName}\\b`, "g"), `"${refName}"`);
}

export async function getRouteExports(routePath: string, schemas: Record<string, unknown>) {
  const content = await fs.readFile(routePath, "utf-8");
  const code = transpile(content);
  const fixedCode = Object.keys(schemas).reduce(injectSchemas, code);
  (global as Record<string, unknown>).schemas = schemas;
  const result = eval(fixedCode);
  delete (global as Record<string, unknown>).schemas;
  return result as Record<string, { apiData?: OperationObject } | undefined>;
}
