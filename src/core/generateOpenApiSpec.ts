import path from "node:path";
import getPackageMetadata from "@omer-x/package-metadata";
import clearUnusedSchemas from "./clearUnusedSchemas";
import { filterDirectoryItems, getDirectoryItems } from "./dir";
import isDocumentedRoute from "./isDocumentedRoute";
import { findAppFolderPath, getRouteExports } from "./next";
import { verifyOptions } from "./options";
import { type RouteRecord, bundlePaths, createRouteRecord } from "./route";
import { bundleSchemas } from "./schema";
import type { OpenApiDocument } from "@omer-x/openapi-types";
import type { ZodType } from "zod";

type GeneratorOptions = {
  include?: string[],
  exclude?: string[],
  routeDefinerName?: string,
  rootPath?: string,
};

export default async function generateOpenApiSpec(schemas: Record<string, ZodType>, {
  include: includeOption = [],
  exclude: excludeOption = [],
  routeDefinerName = "defineRoute",
  rootPath: additionalRootPath,
}: GeneratorOptions = {}) {
  const verifiedOptions = verifyOptions(includeOption, excludeOption);
  const appFolderPath = await findAppFolderPath();
  if (!appFolderPath) throw new Error("This is not a Next.js application!");
  const rootPath = additionalRootPath ? path.resolve(appFolderPath, "./" + additionalRootPath) : appFolderPath;
  const routes = await getDirectoryItems(rootPath, "route.ts");
  const verifiedRoutes = filterDirectoryItems(rootPath, routes, verifiedOptions.include, verifiedOptions.exclude);
  const validRoutes: RouteRecord[] = [];
  for (const route of verifiedRoutes) {
    const isDocumented = await isDocumentedRoute(route);
    if (!isDocumented) continue;
    const exportedRouteHandlers = await getRouteExports(route, routeDefinerName, schemas);
    for (const [method, routeHandler] of Object.entries(exportedRouteHandlers)) {
      if (!routeHandler || !routeHandler.apiData) continue;
      validRoutes.push(createRouteRecord(
        method.toLocaleLowerCase(),
        route,
        rootPath,
        routeHandler.apiData,
      ));
    }
  }
  const metadata = getPackageMetadata();

  const pathsAndComponents = {
    paths: bundlePaths(validRoutes, schemas),
    components: {
      schemas: bundleSchemas(schemas),
    },
  };

  return {
    openapi: "3.1.0",
    info: {
      title: metadata.serviceName,
      version: metadata.version,
    },
    ...clearUnusedSchemas(pathsAndComponents),
    tags: [],
  } as Omit<OpenApiDocument, "components"> & Required<Pick<OpenApiDocument, "components">>;
}
