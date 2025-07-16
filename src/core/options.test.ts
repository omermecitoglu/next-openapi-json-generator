import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyOptions } from "./options";

describe("verifyOptions", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

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

  it("should log invalid paths in development mode", () => {
    process.env.NODE_ENV = "development";
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => { /* do nothing */ });

    const include = ["valid/route.ts", "invalid/path.ts"];
    const exclude = ["another/valid/route.ts", "another/invalid/path.ts"];

    verifyOptions(include, exclude);

    expect(consoleLogSpy).toHaveBeenCalledWith("invalid/path.ts is not a valid route handler path");
    expect(consoleLogSpy).toHaveBeenCalledWith("another/invalid/path.ts is not a valid route handler path");
    consoleLogSpy.mockRestore();
  });

  it("should not log invalid paths in non-development mode", () => {
    process.env.NODE_ENV = "production";
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {
      // do nothing
    });

    const include = ["valid/route.ts", "invalid/path.ts"];
    const exclude = ["another/valid/route.ts", "another/invalid/path.ts"];

    verifyOptions(include, exclude);

    expect(consoleLogSpy).not.toHaveBeenCalled();
    consoleLogSpy.mockRestore();
  });

  it("should handle empty include and exclude arrays", () => {
    expect(verifyOptions([], [])).toEqual({
      include: [],
      exclude: [],
    });
  });
});
