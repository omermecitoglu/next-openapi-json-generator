import { describe, expect, it } from "@jest/globals";
import { verifyOptions } from "./options";

describe("verifyOptions", () => {
  it("should filter out invalid route handler paths", () => {
    const { include, exclude } = verifyOptions([
      "another_file.ts",
      "folder_name/route.ts",
      "**/route.ts",
    ], [
      "another_file.ts",
      "folder_name/route.ts",
      "**/route.ts",
    ]);
    expect(include).toStrictEqual([
      "folder_name/route.ts",
      "**/route.ts",
    ]);
    expect(exclude).toStrictEqual([
      "folder_name/route.ts",
      "**/route.ts",
    ]);
  });
});
