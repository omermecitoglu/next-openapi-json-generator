import type { PathsObject } from "@omer-x/openapi-types/dist/paths";

type RouteRecord = {
  method: string,
  path: string,
  apiData: object,
};

function getRoutePathName(filePath: string, rootPath: string) {
  return filePath
    .replace(rootPath, "")
    .replace("[", "{")
    .replace("]", "}")
    .replace("/route.ts", "");
}

export function createRouteRecord(method: string, filePath: string, rootPath: string, apiData: unknown) {
  return {
    method: method.toLocaleLowerCase(),
    path: getRoutePathName(filePath, rootPath),
    apiData,
  } as RouteRecord;
}

export function bundlePaths(source: RouteRecord[]) {
  source.sort((a, b) => a.path.localeCompare(b.path));
  return source.reduce((collection, route) => ({
    ...collection,
    [route.path]: {
      ...collection[route.path],
      [route.method]: {
        ...route.apiData,
      },
    },
  }), {} as PathsObject);
}
