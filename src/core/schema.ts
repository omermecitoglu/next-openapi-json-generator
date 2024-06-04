import zodToJsonSchema from "zod-to-json-schema";
import type { SchemaObject } from "@omer-x/openapi-types/dist/schema";
import type { ZodType } from "zod";

export function bundleSchemas(schemas: Record<string, ZodType>) {
  return Object.keys(schemas).reduce((collection, schemaName) => {
    return {
      ...collection,
      [schemaName]: zodToJsonSchema(schemas[schemaName], {
        target: "openApi3",
      }),
    } as Record<string, SchemaObject>;
  }, {} as Record<string, SchemaObject>);
}
