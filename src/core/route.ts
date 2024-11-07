import type { ExampleStrategy } from "~/types/example";
import completeExamples from "./completeExamples";
import getRoutePathName from "./getRoutePathName";
import maskOperationSchemas from "./operation-mask";
import type { OperationObject } from "@omer-x/openapi-types/operation";
import type { PathsObject } from "@omer-x/openapi-types/paths";
import type { ZodType } from "zod";

export type RouteRecord = {
  method: string,
  path: string,
  apiData: OperationObject,
  exampleStrategy: ExampleStrategy,
};

export function createRouteRecord(
  method: string,
  filePath: string,
  rootPath: string,
  apiData: OperationObject,
  exampleStrategy: ExampleStrategy = "none",
) {
  return {
    method: method.toLocaleLowerCase(),
    path: getRoutePathName(filePath, rootPath),
    apiData,
    exampleStrategy,
  } as RouteRecord;
}

export function bundlePaths(source: RouteRecord[], storedSchemas: Record<string, ZodType>) {
  source.sort((a, b) => a.path.localeCompare(b.path));
  return source.reduce((collection, route) => ({
    ...collection,
    [route.path]: {
      ...collection[route.path],
      [route.method]: maskOperationSchemas(completeExamples(route.apiData, route.exampleStrategy, storedSchemas), storedSchemas),
    },
  }), {} as PathsObject);
}
