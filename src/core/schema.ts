import convertToOpenAPI from "./zod-to-openapi";
import type { SchemaObject } from "@omer-x/json-schema-types";
import type { ZodType } from "zod";

export function bundleSchemas(schemas: Record<string, ZodType>): Record<string, SchemaObject> {
  const entries = Object.entries(schemas).map(([schemaName, schema]) => {
    return [schemaName, convertToOpenAPI(schema, false)] as const;
  });
  return Object.fromEntries(entries);
}
