import { describe, expect, it } from "vitest";
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
      // @ts-expect-error: @omer-x/openapi-types doesn't have this
      $schema: "https://json-schema.org/draft/2020-12/schema",
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
      // @ts-expect-error: @omer-x/openapi-types doesn't have this
      $schema: "https://json-schema.org/draft/2020-12/schema",
    },
  };

  it("should convert and mask schemas correctly", () => {
    const result = bundleSchemas(mockSchemas);
    expect(result).toStrictEqual(mockOpenAPISchemas);
  });

  it("should handle empty schemas object", () => {
    expect(bundleSchemas({})).toEqual({});
  });
});
