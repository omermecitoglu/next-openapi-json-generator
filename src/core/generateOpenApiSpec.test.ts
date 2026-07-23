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

    const output = await generateOpenApiSpec(schemas);

    expect(output.openapi).toBe("3.1.0");
    expect(output.info.title).toBe("Test Service");
    expect(output.info.version).toBe("1.0.0");
    expect(typeof output.paths).toBe("object");
    expect(Object.keys(output.paths?.["/test"] ?? {})).toEqual(["get", "post"]);
    expect(typeof output.components.schemas).toBe("object");
    expect(Object.keys(output.components.schemas ?? {}).length).toBe(2);

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

    const output = await generateOpenApiSpec(schemas, { rootPath: "/api/v1" });

    expect(output.openapi).toBe("3.1.0");
    expect(output.info.title).toBe("Test Service");
    expect(output.info.version).toBe("1.0.0");

    readFileSpy.mockRestore();
  });
});
