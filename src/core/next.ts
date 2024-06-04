import fs from "node:fs/promises";
import path from "node:path";
import { directoryExists } from "./dir";
import { transpile } from "./transpile";

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

function advancedEval(code: string) {
  try {
    return eval(code);
  } catch (error) {
    if (error instanceof ReferenceError) {
      const refName = error.message.replace("is not defined", "").trim();
      return advancedEval(code.replace(new RegExp(`\\b${refName}\\b`, "g"), `"${refName}"`));
    }
    throw error;
    // console.error(error);
    // return {};
  }
}

export async function getRouteExports(routePath: string) {
  const content = await fs.readFile(routePath, "utf-8");
  const code = transpile(content);
  return advancedEval(code) as Record<string, { apiData?: unknown } | undefined>;
}
