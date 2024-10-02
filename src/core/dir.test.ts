import fs from "fs/promises";
import { describe, expect, it, jest } from "@jest/globals";
import { directoryExists, filterDirectoryItems } from "./dir";

describe("directoryExists", () => {
  it("should return true if directory exists", async () => {
    const dirPath = "/projects/app/src/app";
    jest.spyOn(fs, "access").mockResolvedValueOnce(undefined);
    const result = await directoryExists(dirPath);
    expect(result).toBe(true);
  });

  it("should return false if directory does not exist", async () => {
    const dirPath = "/projects/app/src/app";
    jest.spyOn(fs, "access").mockRejectedValueOnce(new Error("Directory not found"));
    const result = await directoryExists(dirPath);
    expect(result).toBe(false);
  });
});

describe("filterDirectoryItems", () => {
  const rootPath = "/projects/app/src/app";
  it("should filter out items correctly", () => {
    const items = [
      "/projects/app/src/app/users/route.ts",
    ];
    const result = filterDirectoryItems(rootPath, items, [], []);
    expect(result).toStrictEqual([
      "/projects/app/src/app/users/route.ts",
    ]);
  });
  it("should handle wildcards correctly with include list", () => {
    const items = [
      "/projects/app/src/app/a/b/c/d/route.ts",
      "/projects/app/src/app/a/b/b/d/route.ts",
    ];
    const include = [
      "a/*/c/d/route.ts",
    ];
    const result = filterDirectoryItems(rootPath, items, include, []);
    expect(result).toStrictEqual([
      "/projects/app/src/app/a/b/c/d/route.ts",
    ]);
  });
  it("should handle wildcards correctly with exclude list", () => {
    const items = [
      "/projects/app/src/app/users/route.ts",
      "/projects/app/src/app/a/b/c/d/route.ts",
      "/projects/app/src/app/messages/route.ts",
    ];
    const include = [
      "**/route.ts",
    ];
    const exclude = [
      "messages/route.ts",
      "a/**/d/route.ts",
    ];
    const result = filterDirectoryItems(rootPath, items, include, exclude);
    expect(result).toStrictEqual([
      "/projects/app/src/app/users/route.ts",
    ]);
  });
});
