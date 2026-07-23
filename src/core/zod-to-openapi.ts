import { type ZodDefault, type ZodObject, type ZodType, z } from "zod";
import type { SchemaObject } from "@omer-x/json-schema-types";

function alterSchema(schema: ZodType<unknown>, newShape: ZodType<unknown>): ZodType<unknown> {
  if (schema.description) {
    newShape = newShape.describe(schema.description);
  }
  return newShape;
}

function fixSchema(schema: ZodType<unknown>): ZodType<unknown> {
  if ("unwrap" in schema && typeof schema.unwrap === "function") {
    switch (schema._zod.def.type) {
      case "nullable": return alterSchema(schema, fixSchema(schema.unwrap()).nullable());
      case "optional": return alterSchema(schema, fixSchema(schema.unwrap()).optional());
      case "readonly": return alterSchema(schema, fixSchema(schema.unwrap()).readonly());
      case "default": {
        const defaultValue = (schema as unknown as ZodDefault)._zod.def.defaultValue;
        return alterSchema(schema, fixSchema(schema.unwrap()).default(defaultValue));
      }
      case "array": return alterSchema(schema, fixSchema(schema.unwrap()).array());
      default: throw new Error(`${schema._zod.def.type} type is not covered in fixSchema (@omer-x/next-openapi-json-generator")`);
    }
  }
  if (schema._zod.def.type === "date") {
    return alterSchema(schema, z.iso.datetime());
  }
  if (schema._zod.def.type === "object") {
    const { shape } = schema as ZodObject;
    const entries = Object.entries(shape);
    const alteredEntries = entries.map(([propName, prop]) => [propName, fixSchema(prop)]);
    const newShape = Object.fromEntries(alteredEntries);
    return alterSchema(schema, z.object(newShape));
  }
  return schema;
}

export default function convertToOpenAPI(schema: ZodType<unknown>, isArray: boolean): SchemaObject {
  return z.toJSONSchema(fixSchema(isArray ? schema.array() : schema)) as SchemaObject;
}
