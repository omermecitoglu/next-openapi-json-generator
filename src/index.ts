import getPackageMetadata from "@omer-x/package-metadata";
import { filterDirectoryItems, getDirectoryItems } from "./core/dir";
import { findAppFolderPath, getRouteExports } from "./core/next";
import { verifyOptions } from "./core/options";
import { type RouteRecord, bundlePaths, createRouteRecord } from "./core/route";
import { bundleSchemas } from "./core/schema";
import type { OpenApiDocument } from "@omer-x/openapi-types";
import type { ZodType } from "zod";

type GeneratorOptions = {
  include?: string[],
  exclude?: string[],
};

export default async function generateOpenApiSpec(schemas: Record<string, ZodType>, options?: GeneratorOptions) {
  const verifiedOptions = verifyOptions(options?.include, options?.exclude);
  const appFolderPath = await findAppFolderPath();
  if (!appFolderPath) throw new Error("This is not a Next.js application!");
  const routes = await getDirectoryItems(appFolderPath, "route.ts");
  const verifiedRoutes = filterDirectoryItems(appFolderPath, routes, verifiedOptions.include, verifiedOptions.exclude);
  const validRoutes: RouteRecord[] = [];
  for (const route of verifiedRoutes) {
    const exportedRouteHandlers = await getRouteExports(route, schemas);
    for (const [method, routeHandler] of Object.entries(exportedRouteHandlers)) {
      if (!routeHandler || !routeHandler.apiData) continue;
      validRoutes.push(createRouteRecord(
        method.toLocaleLowerCase(),
        route,
        appFolderPath,
        routeHandler.apiData,
      ));
    }
  }
  const metadata = getPackageMetadata();

  return {
    openapi: "3.1.0",
    info: {
      title: metadata.serviceName,
      version: metadata.version,
    },
    paths: bundlePaths(validRoutes, schemas),
    components: {
      schemas: bundleSchemas(schemas),
    },
    tags: [],
  } as Omit<OpenApiDocument, "components"> & Required<Pick<OpenApiDocument, "components">>;
}
