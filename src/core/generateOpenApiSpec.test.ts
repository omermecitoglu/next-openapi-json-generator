import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import z from "zod";
import * as dirUtils from "./dir";
import generateOpenApiSpec from "./generateOpenApiSpec";
import * as next from "./next";

vi.mock("@omer-x/package-metadata", () => ({
  default: vi.fn(() => ({
    serviceName: "Test Service",
    version: "1.0.0",
  })),
}));

describe("generateOpenApiSpec", () => {
  const schemas = {
    UserDTO: z.object({
      id: z.string(),
      name: z.string(),
    }),
    NewUserDTO: z.object({
      id: z.string().optional(),
      name: z.string(),
    }),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should throw an error if not a Next.js application", async () => {
    vi.spyOn(next, "findAppFolderPath").mockResolvedValueOnce(null);

    await expect(generateOpenApiSpec(schemas)).rejects.toThrow("This is not a Next.js application!");
  });

  it("should generate OpenAPI spec correctly", async () => {
    const repoName = "omermecitoglu/example-user-service";
    const branchName = "main";
    const filePath = "src/app/users/route.ts";
    const response = await fetch(`https://raw.githubusercontent.com/${repoName}/refs/heads/${branchName}/${filePath}`);
    const example = await response.text();

    vi.spyOn(next, "findAppFolderPath").mockResolvedValueOnce("/app");
    vi.spyOn(dirUtils, "getDirectoryItems").mockResolvedValueOnce([
      "/app/test/route.ts",
      "/app/api/users/route.ts",
    ]);
    vi.spyOn(dirUtils, "filterDirectoryItems").mockReturnValueOnce([
      "/app/test/route.ts",
      "/app/api/users/route.ts",
    ]);
    const readFileSpy = vi.spyOn(fs, "readFile").mockImplementation(routePath => {
      switch (routePath) {
        case "/app/test/route.ts":
          return Promise.resolve(example);
        case "/app/api/users/route.ts":
          return Promise.resolve("export async function GET(request: Request) {}");
        default:
          throw new Error("Unexpected route path");
      }
      // do nothing
    });

    const result = await generateOpenApiSpec(schemas);

    expect(result).toStrictEqual({
      openapi: "3.1.0",
      info: {
        title: "Test Service",
        version: "1.0.0",
      },
      paths: {
        "/test": {
          get: {
            summary: "Get all users",
            description: "Retrieve a list of users",
            operationId: "getUsers",
            parameters: [
              {
                description: "List of the column names",
                in: "query",
                name: "select",
                required: true,
                schema: {
                  default: [],
                  description: "List of the column names",
                  items: {
                    enum: [
                      "id",
                      "name",
                    ],
                    type: "string",
                  },
                  type: "array",
                },
              },
            ],
            responses: {
              200: {
                content: {
                  "application/json": {
                    schema: {
                      items: {
                        $ref: "#/components/schemas/UserDTO",
                      },
                      type: "array",
                    },
                  },
                },
                description: "Returns a list of users",
              },
              400: {
                description: "Bad Request",
              },
              500: {
                description: "Internal Server Error",
              },
            },
            tags: [
              "Users",
            ],
          },
          post: {
            description: "Create a new user",
            operationId: "createUser",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/NewUserDTO",
                  },
                },
              },
              required: true,
            },
            responses: {
              201: {
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/UserDTO",
                    },
                  },
                },
                description: "User created successfully",
              },
              400: {
                description: "Bad Request",
              },
              409: {
                description: "Email already exists",
              },
              500: {

                description: "Internal Server Error",
              },
            },
            summary: "Create user",
            tags: [
              "Users",
            ],
          },
        },
      },
      components: {
        schemas: {
          UserDTO: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
            },
            additionalProperties: false,
            required: ["id", "name"],
            $schema: "https://json-schema.org/draft/2020-12/schema",
          },
          NewUserDTO: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
            },
            additionalProperties: false,
            required: ["name"],
            $schema: "https://json-schema.org/draft/2020-12/schema",
          },
        },
      },
      tags: [],
    });

    readFileSpy.mockRestore();
  });

  it("should handle rootPath option correctly", async () => {
    const repoName = "omermecitoglu/example-user-service";
    const branchName = "main";
    const filePath = "src/app/users/route.ts";
    const response = await fetch(`https://raw.githubusercontent.com/${repoName}/refs/heads/${branchName}/${filePath}`);
    const example = await response.text();

    vi.spyOn(next, "findAppFolderPath").mockResolvedValueOnce("/app");
    vi.spyOn(dirUtils, "getDirectoryItems").mockResolvedValueOnce([
      "/app/api/v1/test/route.ts",
      "/app/api/v1/users/route.ts",
    ]);
    vi.spyOn(dirUtils, "filterDirectoryItems").mockReturnValueOnce([
      "/app/api/v1/test/route.ts",
      "/app/api/v1/users/route.ts",
    ]);
    const readFileSpy = vi.spyOn(fs, "readFile").mockImplementation(routePath => {
      switch (routePath) {
        case "/app/api/v1/test/route.ts":
          return Promise.resolve(example);
        case "/app/api/v1/users/route.ts":
          return Promise.resolve("export async function GET(request: Request) {}");
        default:
          throw new Error("Unexpected route path");
      }
      // do nothing
    });

    const result = await generateOpenApiSpec(schemas, { rootPath: "/api/v1" });

    expect(result).toEqual({
      openapi: "3.1.0",
      info: {
        title: "Test Service",
        version: "1.0.0",
      },
      paths: {
        "/test": {
          get: {
            summary: "Get all users",
            description: "Retrieve a list of users",
            operationId: "getUsers",
            parameters: [
              {
                description: "List of the column names",
                in: "query",
                name: "select",
                required: true,
                schema: {
                  default: [],
                  description: "List of the column names",
                  items: {
                    enum: [
                      "id",
                      "name",
                    ],
                    type: "string",
                  },
                  type: "array",
                },
              },
            ],
            responses: {
              200: {
                content: {
                  "application/json": {
                    schema: {
                      items: {
                        $ref: "#/components/schemas/UserDTO",
                      },
                      type: "array",
                    },
                  },
                },
                description: "Returns a list of users",
              },
              400: {
                description: "Bad Request",
              },
              500: {
                description: "Internal Server Error",
              },
            },
            tags: [
              "Users",
            ],
          },
          post: {
            description: "Create a new user",
            operationId: "createUser",
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/NewUserDTO",
                  },
                },
              },
              required: true,
            },
            responses: {
              201: {
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/UserDTO",
                    },
                  },
                },
                description: "User created successfully",
              },
              400: {
                description: "Bad Request",
              },
              409: {
                description: "Email already exists",
              },
              500: {

                description: "Internal Server Error",
              },
            },
            summary: "Create user",
            tags: [
              "Users",
            ],
          },
        },
      },
      components: {
        schemas: {
          UserDTO: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
            },
            additionalProperties: false,
            required: ["id", "name"],
            $schema: "https://json-schema.org/draft/2020-12/schema",
          },
          NewUserDTO: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
              },
            },
            additionalProperties: false,
            required: ["name"],
            $schema: "https://json-schema.org/draft/2020-12/schema",
          },
        },
      },
      tags: [],
    });

    readFileSpy.mockRestore();
  });
});
