import fs from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import z from "zod";
import { directoryExists } from "./dir";
import { findAppFolderPath, getRouteExports } from "./next";

jest.mock("node:fs/promises");
jest.mock("node:path");
jest.mock("./dir");

describe("findAppFolderPath", () => {
  it("should return src/app if it exists", async () => {
    (directoryExists as jest.Mock<typeof directoryExists>).mockResolvedValueOnce(true);
    const result = await findAppFolderPath();
    expect(result).toBe(path.resolve(process.cwd(), "src", "app"));
  });

  it("should return app if src/app does not exist but app does", async () => {
    (directoryExists as jest.Mock<typeof directoryExists>).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const result = await findAppFolderPath();
    expect(result).toBe(path.resolve(process.cwd(), "app"));
  });

  it("should return null if neither src/app nor app exists", async () => {
    (directoryExists as jest.Mock<typeof directoryExists>).mockResolvedValueOnce(false).mockResolvedValueOnce(false);
    const result = await findAppFolderPath();
    expect(result).toBeNull();
  });
});

describe("getRouteExports", async () => {
  const mockSchemas = {
    UserDTO: z.object({
      id: z.string(),
      name: z.string(),
    }),
    NewUserDTO: z.object({
      id: z.string().optional(),
      name: z.string(),
    }),
  };
  const mockRoutePath = "/mock/path";
  const mockRouteDefinerName = "defineRoute";
  const repoName = "omermecitoglu/example-user-service";
  const branchName = "main";
  const filePath = "src/app/users/route.ts";
  const response = await fetch(`https://raw.githubusercontent.com/${repoName}/refs/heads/${branchName}/${filePath}`);
  const example = await response.text();

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readFile as jest.Mock<typeof fs.readFile>).mockResolvedValue(example);
  });

  it("should read the file content", async () => {
    await getRouteExports(mockRoutePath, mockRouteDefinerName, mockSchemas);
    expect(fs.readFile).toHaveBeenCalledWith(mockRoutePath, "utf-8");
  });

  it("should transpile the content", async () => {
    const exportedRoutes = await getRouteExports(mockRoutePath, mockRouteDefinerName, mockSchemas);
    const validRoutes = Object.keys(exportedRoutes).filter(key => !!exportedRoutes[key]);
    expect(validRoutes).toStrictEqual(["GET", "POST"]);
  });

  it("should handle errors during evaluation", async () => {
    const error = new Error("Eval error");
    const evalSpy = jest.spyOn(global, "eval").mockImplementation(() => {
      throw error;
    });
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {
      // do nothing
    });

    await expect(getRouteExports(mockRoutePath, mockRouteDefinerName, mockSchemas)).rejects.toThrow(error);
    expect(consoleLogSpy).toHaveBeenCalledWith(`An error occured while evaluating the route exports from "${mockRoutePath}"`);

    evalSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});
