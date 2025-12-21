import { describe, expect, it } from "vitest";
import { bundlePaths, createRouteRecord } from "./route";
import type { OperationObject } from "@omer-x/openapi-types/operation";

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

    const result = bundlePaths(source);

    expect(result).toStrictEqual({
      "/users": {
        get: {
          summary: "Get users",
        },
        post: {
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

    const result = bundlePaths(source);

    expect(result).toStrictEqual({
      "/items": {
        get: {
          summary: "Get items",
        },
      },
      "/users": {
        get: {
          summary: "Get users",
        },
        post: {
          summary: "Create user",
        },
      },
    });
  });

  it("should handle the cases where schema is undefined or referenced already", () => {
    const source = [
      {
        method: "get",
        path: "/user",
        apiData: {
          summary: "Get user",
          parameters: [
            {
              $ref: "#/components/parameters/QueryLimit",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: undefined,
                },
              },
            },
            404: {
              $ref: "#/components/responses/NotFound",
            },
          },
        } as OperationObject,
      },
    ];

    const result = bundlePaths(source);

    expect(result).toStrictEqual({
      "/user": {
        get: {
          parameters: [
            {
              $ref: "#/components/parameters/QueryLimit",
            },
          ],
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: undefined,
                },
              },
              description: "Successful response",
            },
            404: {
              $ref: "#/components/responses/NotFound",
            },
          },
          summary: "Get user",
        },
      },
    });
  });
});
