import deepEqual from "~/utils/deepEqual";
import convertToOpenAPI from "./zod-to-openapi";
import type { SchemaObject } from "@omer-x/openapi-types/schema";
import type { ZodType } from "zod";

export default function maskWithReference(
  schema: SchemaObject,
  storedSchemas: Record<string, ZodType>,
  self: boolean
): SchemaObject {
  if (self) {
    for (const [schemaName, zodSchema] of Object.entries(storedSchemas)) {
      if (deepEqual(schema, convertToOpenAPI(zodSchema, false))) {
        return {
          $ref: `#/components/schemas/${schemaName}`,
        };
      }
    }
  }
  if ("$ref" in schema) return schema;
  if (schema.oneOf) {
    return {
      ...schema,
      oneOf: schema.oneOf.map(i => maskWithReference(i, storedSchemas, true)),
    };
  }
  if (schema.anyOf) {
    return {
      ...schema,
      anyOf: schema.anyOf.map(i => maskWithReference(i, storedSchemas, true)),
    };
  }
  switch (schema.type) {
    case "object":
      return {
        ...schema,
        properties: Object.entries(schema.properties ?? {}).reduce((props, [propName, prop]) => ({
          ...props,
          [propName]: maskWithReference(prop, storedSchemas, true),
        }), {}),
      };
    case "array":
      if (Array.isArray(schema.items)) {
        return {
          ...schema,
          items: schema.items.map(i => maskWithReference(i, storedSchemas, true)),
        };
      }
      return {
        ...schema,
        items: maskWithReference(schema.items, storedSchemas, true),
      };
  }
  return schema;
}
