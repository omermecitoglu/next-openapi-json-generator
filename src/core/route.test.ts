import { describe, expect, it } from "@jest/globals";
import { bundlePaths, createRouteRecord } from "./route";
import type { OperationObject } from "@omer-x/openapi-types/operation";
import type { ZodType } from "zod";

describe("createRouteRecord", () => {
  it("should create a route record with the correct method, path, and apiData", () => {
    const method = "GET";
    const filePath = "/home/omer/Projects/next-openapi-json-generator/src/core/[id]/route.ts";
    const rootPath = "/home/omer/Projects/next-openapi-json-generator/src/core";
    const apiData: OperationObject = { summary: "Get item by ID" };

    const result = createRouteRecord(method, filePath, rootPath, apiData);

    expect(result).toStrictEqual({
      method: "get",
      path: "/{id}",
      apiData,
    });
  });
});

describe("bundlePaths", () => {
  it("should bundle paths correctly", () => {
    const source = [
      {
        method: "get",
        path: "/users",
        apiData: { summary: "Get users" } as OperationObject,
      },
      {
        method: "post",
        path: "/users",
        apiData: { summary: "Create user" } as OperationObject,
      },
    ];
    const storedSchemas: Record<string, ZodType> = {};

    const result = bundlePaths(source, storedSchemas);

    expect(result).toStrictEqual({
      "/users": {
        get: {
          parameters: undefined,
          requestBody: undefined,
          responses: undefined,
          summary: "Get users",
        },
        post: {
          parameters: undefined,
          requestBody: undefined,
          responses: undefined,
          summary: "Create user",
        },
      },
    });
  });

  it("should sort paths and methods correctly", () => {
    const source = [
      {
        method: "post",
        path: "/users",
        apiData: { summary: "Create user" } as OperationObject,
      },
      {
        method: "get",
        path: "/users",
        apiData: { summary: "Get users" } as OperationObject,
      },
      {
        method: "get",
        path: "/items",
        apiData: { summary: "Get items" } as OperationObject,
      },
    ];
    const storedSchemas: Record<string, ZodType> = {};

    const result = bundlePaths(source, storedSchemas);

    expect(result).toStrictEqual({
      "/items": {
        get: {
          parameters: undefined,
          requestBody: undefined,
          responses: undefined,
          summary: "Get items",
        },
      },
      "/users": {
        get: {
          parameters: undefined,
          requestBody: undefined,
          responses: undefined,
          summary: "Get users",
        },
        post: {
          parameters: undefined,
          requestBody: undefined,
          responses: undefined,
          summary: "Create user",
        },
      },
    });
  });
});
