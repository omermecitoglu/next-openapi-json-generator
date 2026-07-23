import getRoutePathName from "./getRoutePathName";
import type { OperationObject } from "@omer-x/openapi-types/operation";
import type { PathsObject } from "@omer-x/openapi-types/paths";

export type RouteRecord = {
  method: string,
  path: string,
  apiData: OperationObject,
};

export function createRouteRecord(method: string, filePath: string, rootPath: string, apiData: OperationObject): RouteRecord {
  return {
    method: method.toLocaleLowerCase(),
    path: getRoutePathName(filePath, rootPath),
    apiData,
  };
}

export function bundlePaths(source: RouteRecord[]): PathsObject {
  source.sort((a, b) => a.path.localeCompare(b.path));
  return source.reduce((collection, route) => ({
    ...collection,
    [route.path]: {
      ...collection[route.path],
      [route.method]: route.apiData,
    },
  }), {} as PathsObject);
}
