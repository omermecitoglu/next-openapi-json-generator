import { describe, expect, it } from "@jest/globals";
import { filterDirectoryItems } from "./dir";

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
