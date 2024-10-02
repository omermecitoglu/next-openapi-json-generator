import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import getPackageMetadata from "@omer-x/package-metadata";
import z from "zod";
import { filterDirectoryItems, getDirectoryItems } from "./dir";
import generateOpenApiSpec from "./generateOpenApiSpec";
import * as next from "./next";

jest.mock("./dir");
jest.mock("@omer-x/package-metadata");

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
    jest.resetAllMocks();
  });

  it("should throw an error if not a Next.js application", async () => {
    jest.spyOn(next, "findAppFolderPath").mockResolvedValueOnce(null);

    await expect(generateOpenApiSpec(schemas)).rejects.toThrow("This is not a Next.js application!");
  });

  it("should generate OpenAPI spec correctly", async () => {
    const repoName = "omermecitoglu/example-user-service";
    const branchName = "main";
    const filePath = "src/app/users/route.ts";
    const response = await fetch(`https://raw.githubusercontent.com/${repoName}/refs/heads/${branchName}/${filePath}`);
    const example = await response.text();

    jest.spyOn(next, "findAppFolderPath").mockResolvedValueOnce("/app");
    (getDirectoryItems as jest.Mock<typeof getDirectoryItems>).mockResolvedValue([
      "/app/test/route.ts",
      "/app/api/users/route.ts",
    ]);
    (filterDirectoryItems as jest.Mock<typeof filterDirectoryItems>).mockReturnValue([
      "/app/test/route.ts",
      "/app/api/users/route.ts",
    ]);
    const readFileSpy = jest.spyOn(fs, "readFile").mockImplementation(routePath => {
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
    (getPackageMetadata as jest.Mock).mockReturnValue({
      serviceName: "Test Service",
      version: "1.0.0",
    });

    const result = await generateOpenApiSpec(schemas);

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
                required: false,
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
            requestBody: undefined,
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
                content: undefined,
                description: "Bad Request",
              },
              500: {
                content: undefined,
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
            parameters: undefined,
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
                content: undefined,
                description: "Bad Request",
              },
              409: {
                content: undefined,
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
          },
        },
      },
      tags: [],
    });

    readFileSpy.mockRestore();
  });
});
