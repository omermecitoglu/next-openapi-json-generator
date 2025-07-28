import fs from "node:fs/promises";
import path from "node:path";
import { defineRoute } from "@omer-x/next-openapi-route-handler";
import { z } from "zod";
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

async function safeEval(code: string, routePath: string) {
  try {
    if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
      return eval(code);
    }
    return await import(/* webpackIgnore: true */ `data:text/javascript,${encodeURIComponent(code)}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`An error occured while evaluating the route exports from "${routePath}"`);
    throw error;
  }
}

export async function getRouteExports(routePath: string, routeDefinerName: string, schemas: Record<string, unknown>) {
  const rawCode = await fs.readFile(routePath, "utf-8");
  const middlewareName = detectMiddlewareName(rawCode);
  const isCommonJS = typeof module !== "undefined" && typeof module.exports !== "undefined";
  const { transpileModule } = await import(/* webpackIgnore: true */ "typescript");
  const code = transpile(isCommonJS, rawCode, middlewareName, transpileModule);
  const fixedCode = Object.keys(schemas).reduce(injectSchemas, code);
  (global as Record<string, unknown>)[routeDefinerName] = defineRoute;
  (global as Record<string, unknown>).z = z;
  (global as Record<string, unknown>).schemas = schemas;
  const result = await safeEval(fixedCode, routePath);
  delete (global as Record<string, unknown>).schemas;
  delete (global as Record<string, unknown>)[routeDefinerName];
  delete (global as Record<string, unknown>).z;
  return result as Record<string, { apiData?: OperationObject } | undefined>;
}
