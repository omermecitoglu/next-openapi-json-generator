import path from "node:path";
import getPackageMetadata from "@omer-x/package-metadata";
import clearUnusedSchemasFunction from "./clearUnusedSchemas";
import { filterDirectoryItems, getDirectoryItems } from "./dir";
import isDocumentedRoute from "./isDocumentedRoute";
import { findAppFolderPath, getRouteExports } from "./next";
import { verifyOptions } from "./options";
import { type RouteRecord, bundlePaths, createRouteRecord } from "./route";
import { bundleSchemas } from "./schema";
import type { OpenApiDocument } from "@omer-x/openapi-types";
import type { ComponentsObject } from "@omer-x/openapi-types/components";
import type { ServerObject } from "@omer-x/openapi-types/server";
import type { ZodType } from "zod";

type GeneratorOptions = {
  include?: string[],
  exclude?: string[],
  routeDefinerName?: string,
  rootPath?: string,
  servers?: ServerObject[],
  security?: OpenApiDocument["security"],
  securitySchemes?: ComponentsObject["securitySchemes"],
  clearUnusedSchemas?: boolean,
};

export default async function generateOpenApiSpec(schemas: Record<string, ZodType>, {
  include: includeOption = [],
  exclude: excludeOption = [],
  routeDefinerName = "defineRoute",
  rootPath: additionalRootPath,
  servers,
  security,
  securitySchemes,
  clearUnusedSchemas: clearUnusedSchemasOption = true,
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
      securitySchemes,
    },
  };

  return {
    openapi: "3.1.0",
    info: {
      title: metadata.serviceName,
      version: metadata.version,
    },
    servers,
    ...(clearUnusedSchemasOption ? clearUnusedSchemasFunction(pathsAndComponents) : pathsAndComponents),
    security,
    tags: [],
  } as Omit<OpenApiDocument, "components"> & Required<Pick<OpenApiDocument, "components">>;
}
