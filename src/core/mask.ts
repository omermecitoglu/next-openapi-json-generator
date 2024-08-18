import convertToOpenAPI from "./zod-to-openapi";
import type { SchemaObject } from "@omer-x/openapi-types/schema";
import type { ZodType } from "zod";

function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a !== typeof b) return false;
  switch (typeof a) {
    case "object": {
      if (a === null) return a === b;
      if (!b) return false;
      if (Array.isArray(a)) {
        if (!Array.isArray(b)) return false;
        return a.every((item, index) => deepEqual(item, b[index]));
      }
      return Object.entries(a).every(([key, value]) => deepEqual(value, (b as Record<string, unknown>)[key]));
    }
    case "function":
    case "symbol":
      return false;
    default:
      return a === b;
  }
}

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
