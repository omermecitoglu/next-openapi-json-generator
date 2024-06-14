import zodToJsonSchema from "zod-to-json-schema";
import maskWithReference from "./mask";
import type { SchemaObject } from "@omer-x/openapi-types/schema";
import type { ZodType } from "zod";

export function bundleSchemas(schemas: Record<string, ZodType>) {
  const bundledSchemas = Object.keys(schemas).reduce((collection, schemaName) => {
    return {
      ...collection,
      [schemaName]: zodToJsonSchema(schemas[schemaName], {
        target: "openApi3",
      }),
    } as Record<string, SchemaObject>;
  }, {} as Record<string, SchemaObject>);

  return Object.entries(bundledSchemas).reduce((bundle, [schemaName, schema]) => ({
    ...bundle,
    [schemaName]: maskWithReference(schema, schemas, false),
  }), {} as Record<string, SchemaObject>);
}
