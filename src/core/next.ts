import fs from "node:fs/promises";
import path from "node:path";
import type { ExampleStrategy } from "~/types/example";
import { directoryExists } from "./dir";
import injectSchemas from "./injectSchemas";
import { detectMiddlewareName } from "./middleware";
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

function safeEval(code: string, routePath: string) {
  try {
    return eval(code);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`An error occured while evaluating the route exports from "${routePath}"`);
    throw error;
  }
}

export async function getRouteExports(routePath: string, routeDefinerName: string, schemas: Record<string, unknown>) {
  const rawCode = await fs.readFile(routePath, "utf-8");
  const middlewareName = detectMiddlewareName(rawCode);
  const code = transpile(rawCode, routeDefinerName, middlewareName);
  const fixedCode = Object.keys(schemas).reduce(injectSchemas, code);
  (global as Record<string, unknown>).schemas = schemas;
  const result = safeEval(fixedCode, routePath);
  delete (global as Record<string, unknown>).schemas;
  return result as Record<string, { apiData?: OperationObject, exampleStrategy?: ExampleStrategy } | undefined>;
}
