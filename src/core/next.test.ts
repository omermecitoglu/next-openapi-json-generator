import fs from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import z from "zod";
import * as utils from "./dir";
import { findAppFolderPath, getRouteExports } from "./next";

describe("findAppFolderPath", () => {
  it("should return src/app if it exists", async () => {
    vi.spyOn(utils, "directoryExists").mockResolvedValueOnce(true);
    const result = await findAppFolderPath();
    expect(result).toBe(path.resolve(process.cwd(), "src", "app"));
  });

  it("should return app if src/app does not exist but app does", async () => {
    vi.spyOn(utils, "directoryExists").mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const result = await findAppFolderPath();
    expect(result).toBe(path.resolve(process.cwd(), "app"));
  });

  it("should return null if neither src/app nor app exists", async () => {
    vi.spyOn(utils, "directoryExists").mockResolvedValueOnce(false).mockResolvedValueOnce(false);
    const result = await findAppFolderPath();
    expect(result).toBeNull();
  });
});

describe("getRouteExports", () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(fs, "readFile").mockImplementation(() => {
      const repoName = "omermecitoglu/example-user-service";
      const branchName = "main";
      const filePath = "src/app/users/route.ts";
      const url = `https://raw.githubusercontent.com/${repoName}/refs/heads/${branchName}/${filePath}`;
      return fetch(url).then(response => response.text());
    });
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
    const evalSpy = vi.spyOn(global, "eval").mockImplementation(() => {
      throw error;
    });
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => { /* do nothing */ });

    await expect(getRouteExports(mockRoutePath, mockRouteDefinerName, mockSchemas)).rejects.toThrow(error);
    expect(consoleLogSpy).toHaveBeenCalledWith(`An error occured while evaluating the route exports from "${mockRoutePath}"`);

    evalSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});
