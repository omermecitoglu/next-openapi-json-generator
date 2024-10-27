import getPackageMetadata from "@omer-x/package-metadata";
import clearUnusedSchemas from "./clearUnusedSchemas";
import { filterDirectoryItems, getDirectoryItems } from "./dir";
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
};

export default async function generateOpenApiSpec(schemas: Record<string, ZodType>, {
  include: includeOption = [],
  exclude: excludeOption = [],
  routeDefinerName = "defineRoute",
}: GeneratorOptions = {}) {
  const verifiedOptions = verifyOptions(includeOption, excludeOption);
  const appFolderPath = await findAppFolderPath();
  if (!appFolderPath) throw new Error("This is not a Next.js application!");
  const routes = await getDirectoryItems(appFolderPath, "route.ts");
  const verifiedRoutes = filterDirectoryItems(appFolderPath, routes, verifiedOptions.include, verifiedOptions.exclude);
  const validRoutes: RouteRecord[] = [];
  for (const route of verifiedRoutes) {
    const exportedRouteHandlers = await getRouteExports(route, routeDefinerName, schemas);
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
