import { type ZodObject, type ZodType, z } from "zod";
import type { SchemaObject } from "@omer-x/json-schema-types";

function fixSchema(schema: ZodType<unknown>): ZodType<unknown> {
  if ("unwrap" in schema && typeof schema.unwrap === "function") {
    switch (schema._zod.def.type) {
      case "nullable": return fixSchema(schema.unwrap()).nullable();
      case "optional": return fixSchema(schema.unwrap()).optional();
      case "readonly": return fixSchema(schema.unwrap()).readonly();
      case "array": return fixSchema(schema.unwrap()).array();
      default: throw new Error(`${schema._zod.def.type} type is not covered in fixSchema (@omer-x/next-openapi-json-generator")`);
    }
  }
  if (schema._zod.def.type === "date") {
    return z.iso.datetime();
  }
  if (schema._zod.def.type === "object") {
    const { shape } = schema as ZodObject;
    const entries = Object.entries(shape);
    const alteredEntries = entries.map(([propName, prop]) => [propName, fixSchema(prop)]);
    const newShape = Object.fromEntries(alteredEntries);
    return z.object(newShape);
  }
  return schema;
}

export default function convertToOpenAPI(schema: ZodType<unknown>, isArray: boolean) {
  return z.toJSONSchema(fixSchema(isArray ? schema.array() : schema)) as SchemaObject;
}
