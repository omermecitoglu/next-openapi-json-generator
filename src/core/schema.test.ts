import { describe, expect, it } from "@jest/globals";
import z from "zod";
import { bundleSchemas } from "./schema";
import type { SchemaObject } from "@omer-x/openapi-types/schema";

describe("bundleSchemas", () => {
  const mockSchemas = {
    User: z.object({
      name: z.string(),
      age: z.number(),
    }),
    Product: z.object({
      title: z.string(),
      price: z.number(),
    }),
  };

  const mockOpenAPISchemas: Record<string, SchemaObject> = {
    User: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        age: {
          type: "number",
        },
      },
      additionalProperties: false,
      required: ["name", "age"],
    },
    Product: {
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        price: {
          type: "number",
        },
      },
      additionalProperties: false,
      required: ["title", "price"],
    },
  };

  it("should convert and mask schemas correctly", () => {
    const result = bundleSchemas(mockSchemas);
    expect(result).toEqual(mockOpenAPISchemas);
  });

  it("should handle empty schemas object", () => {
    expect(bundleSchemas({})).toEqual({});
  });
});
