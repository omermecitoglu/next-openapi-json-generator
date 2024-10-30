import getRoutePathName from "./getRoutePathName";
import maskOperationSchemas from "./operation-mask";
import type { OperationObject } from "@omer-x/openapi-types/operation";
import type { PathsObject } from "@omer-x/openapi-types/paths";
import type { ZodType } from "zod";

export type RouteRecord = {
  method: string,
  path: string,
  apiData: OperationObject,
};

export function createRouteRecord(method: string, filePath: string, rootPath: string, apiData: OperationObject) {
  return {
    method: method.toLocaleLowerCase(),
    path: getRoutePathName(filePath, rootPath),
    apiData,
  } as RouteRecord;
}

export function bundlePaths(source: RouteRecord[], storedSchemas: Record<string, ZodType>) {
  source.sort((a, b) => a.path.localeCompare(b.path));
  return source.reduce((collection, route) => ({
    ...collection,
    [route.path]: {
      ...collection[route.path],
      [route.method]: maskOperationSchemas(route.apiData, storedSchemas),
    },
  }), {} as PathsObject);
}
