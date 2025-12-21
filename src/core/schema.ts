import convertToOpenAPI from "./zod-to-openapi";
import type { ZodType } from "zod";

export function bundleSchemas(schemas: Record<string, ZodType>) {
  const entries = Object.entries(schemas).map(([schemaName, schema]) => {
    return [schemaName, convertToOpenAPI(schema, false)] as const;
  });
  return Object.fromEntries(entries);
}
