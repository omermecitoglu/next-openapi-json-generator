import fs from "node:fs/promises";

export default async function isDocumentedRoute(routePath: string) {
  try {
    const rawCode = await fs.readFile(routePath, "utf-8");
    return rawCode.includes("@omer-x/next-openapi-route-handler");
  } catch {
    return false;
  }
}
