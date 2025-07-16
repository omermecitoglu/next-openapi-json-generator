import { beforeEach, describe, expect, it, vi } from "vitest";
import z, { type ZodType } from "zod";
import maskWithReference from "./mask";
import type { SchemaObject } from "@omer-x/openapi-types/schema";


describe("maskWithReference", () => {
  const storedSchemas: Record<string, ZodType> = {
    User: z.object({
      id: z.string(),
      name: z.string(),
    }),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return a reference if schema matches a stored schema", () => {
    const schema: SchemaObject = {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
      required: ["id", "name"],
      additionalProperties: false,
      // @ts-expect-error: @omer-x/openapi-types doesn't have this
      $schema: "https://json-schema.org/draft/2020-12/schema",
    };

    const result = maskWithReference(schema, storedSchemas, true);
    expect(result).toEqual({ $ref: "#/components/schemas/User" });
  });

  it("should return the schema if it contains a $ref", () => {
    const schema: SchemaObject = {
      $ref: "#/components/schemas/SomeSchema",
    };
    const result = maskWithReference(schema, storedSchemas, true);
    expect(result).toEqual(schema);
  });

  it("should process oneOf schemas", () => {
    const schema = {
      oneOf: [
        { type: "string" },
        { type: "number" },
      ],
    } as unknown as SchemaObject;
    const result = maskWithReference(schema, storedSchemas, true);
    expect(result).toEqual({
      oneOf: [
        { type: "string" },
        { type: "number" },
      ],
    });
  });

  it("should process anyOf schemas", () => {
    const schema = {
      anyOf: [
        { type: "string" },
        { type: "number" },
      ],
    } as unknown as SchemaObject;
    const result = maskWithReference(schema, storedSchemas, true);
    expect(result).toEqual({
      anyOf: [
        { type: "string" },
        { type: "number" },
      ],
    });
  });

  it("should process object schemas", () => {
    const schema: SchemaObject = {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
      required: ["id", "name"],
      additionalProperties: false,
      // @ts-expect-error: @omer-x/openapi-types doesn't have this
      $schema: "https://json-schema.org/draft/2020-12/schema",
    };
    const result = maskWithReference(schema, storedSchemas, true);
    expect(result).toEqual({
      $ref: "#/components/schemas/User",
    });
  });

  it("should process array schemas", () => {
    const schema: SchemaObject = {
      type: "array",
      items: { type: "string" },
    };
    const result = maskWithReference(schema, storedSchemas, true);
    expect(result).toEqual({
      type: "array",
      items: { type: "string" },
    });
  });

  it("should process array schemas with multiple items", () => {
    const schema: SchemaObject = {
      type: "array",
      items: [
        { type: "string" },
        { type: "number" },
      ],
    };
    const result = maskWithReference(schema, storedSchemas, true);
    expect(result).toEqual({
      type: "array",
      items: [
        { type: "string" },
        { type: "number" },
      ],
    });
  });
});
