import path from "node:path";
import { describe, expect, it, jest } from "@jest/globals";
import getRoutePathName from "./getRoutePathName";

describe("getRoutePathName", () => {
  const rootPath = "/home/omer/Projects/nextjs-app/src/app";

  it("should return correct route path by removing rootPath and adjusting path", () => {
    const result = getRoutePathName(
      "/home/omer/Projects/nextjs-app/src/app/users/[id]/route.ts",
      rootPath
    );
    expect(result).toBe("/users/{id}");
  });

  it("should replace backslashes with forward slashes", () => {
    jest.spyOn(path, "dirname").mockReturnValueOnce("C:\\users\\omer\\Projects\\nextjs-app\\src\\app\\users\\[id]");
    jest.spyOn(path, "relative").mockReturnValueOnce("users\\[id]");
    const result = getRoutePathName(
      "C:\\users\\omer\\Projects\\nextjs-app\\src\\app\\users\\[id]\\route.ts",
      "C:\\users\\omer\\Projects\\nextjs-app\\src\\app",
    );
    expect(result).toBe("/users/{id}");
  });

  it("should handle nested folders with parameters", () => {
    const result = getRoutePathName(
      "/home/omer/Projects/nextjs-app/src/app/users/[user]/[post]/route.ts",
      rootPath
    );
    expect(result).toBe("/users/{user}/{post}");
  });

  it("should remove '/route.ts' if present", () => {
    const result = getRoutePathName(
      "/home/omer/Projects/nextjs-app/src/app/users/test/route.ts",
      rootPath
    );
    expect(result).toBe("/users/test");
  });

  it("should handle cases with no parameters", () => {
    const result = getRoutePathName(
      "/home/omer/Projects/nextjs-app/src/app/users/home/route.ts",
      rootPath
    );
    expect(result).toBe("/users/home");
  });
});
