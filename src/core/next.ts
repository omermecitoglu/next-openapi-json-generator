import fs from "node:fs/promises";
import path from "node:path";
import { defineRoute } from "@omer-x/next-openapi-route-handler";
import { z } from "zod";
import { directoryExists } from "./dir";
import injectSchemas from "./injectSchemas";
import { detectMiddlewareName } from "./middleware";
import { transpile } from "./transpile";
import type { OperationObject } from "@omer-x/openapi-types/operation";
import type { TranspileOptions, TranspileOutput } from "typescript";

export async function findAppFolderPath(): Promise<string | null> {
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

function safeEval(code: string, routePath: string): Record<string, { apiData?: OperationObject } | undefined> {
  try {
    const sandboxExports: Record<string, unknown> = {};
    const sandboxModule = { exports: sandboxExports };
    const sandboxRequire = (): Record<string, never> => ({});
    new Function("exports", "module", "require", code)(sandboxExports, sandboxModule, sandboxRequire);
    return sandboxModule.exports as Record<string, { apiData?: OperationObject } | undefined>;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`An error occured while evaluating the route exports from "${routePath}"`);
    throw error;
  }
}

async function getModuleTranspiler(): Promise<(input: string, transpileOptions: TranspileOptions) => TranspileOutput> {
  if (typeof require !== "undefined" && typeof exports !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(/* webpackIgnore: true */ "typescript").transpileModule;
  }
  const { transpileModule } = await import(/* webpackIgnore: true */ "typescript");
  return transpileModule;
}

export async function getRouteExports(
  routePath: string,
  routeDefinerName: string,
  schemas: Record<string, unknown>,
): Promise<Record<string, { apiData?: OperationObject } | undefined>> {
  const rawCode = await fs.readFile(routePath, "utf-8");
  const middlewareName = detectMiddlewareName(rawCode);
  const code = transpile(true, rawCode, middlewareName, await getModuleTranspiler());
  const fixedCode = Object.keys(schemas).reduce(injectSchemas, code);
  const globalScope = global as Record<string, unknown>;
  const originalDescriptors = new Map<string, PropertyDescriptor | undefined>([
    [routeDefinerName, Object.getOwnPropertyDescriptor(global, routeDefinerName)],
    ["z", Object.getOwnPropertyDescriptor(global, "z")],
    ["schemas", Object.getOwnPropertyDescriptor(global, "schemas")],
  ]);
  try {
    globalScope[routeDefinerName] = defineRoute;
    globalScope.z = z;
    globalScope.schemas = schemas;
    return safeEval(fixedCode, routePath);
  } finally {
    for (const [key, descriptor] of originalDescriptors) {
      if (descriptor) {
        Object.defineProperty(global, key, descriptor);
      } else {
        delete globalScope[key];
      }
    }
  }
}
