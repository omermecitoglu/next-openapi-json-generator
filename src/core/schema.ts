import maskWithReference from "./mask";
import convertToOpenAPI from "./zod-to-openapi";
import type { SchemaObject } from "@omer-x/openapi-types/schema";
import type { ZodType } from "zod";

export function bundleSchemas(schemas: Record<string, ZodType>) {
  const bundledSchemas = Object.keys(schemas).reduce((collection, schemaName) => {
    return {
      ...collection,
      [schemaName]: convertToOpenAPI(schemas[schemaName], false),
    } as Record<string, SchemaObject>;
  }, {} as Record<string, SchemaObject>);

  return Object.entries(bundledSchemas).reduce((bundle, [schemaName, schema]) => ({
    ...bundle,
    [schemaName]: maskWithReference(schema, schemas, false),
  }), {} as Record<string, SchemaObject>);
}
