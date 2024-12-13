import fs from "node:fs/promises";
import { describe, expect, it, jest } from "@jest/globals";
import isDocumentedRoute from "./isDocumentedRoute";

jest.mock("node:fs/promises");

describe("isDocumentedRoute", () => {
  it("should return true if the file contains the target string", async () => {
    const mockFileContent = "import { handler } from '@omer-x/next-openapi-route-handler';";
    jest.spyOn(fs, "readFile").mockResolvedValue(mockFileContent);

    const result = await isDocumentedRoute("some/path/to/file.ts");
    expect(result).toBe(true);
  });

  it("should return false if the file does not contain the target string", async () => {
    const mockFileContent = "import someOtherLibrary from 'another-package';";
    jest.spyOn(fs, "readFile").mockResolvedValue(mockFileContent);

    const result = await isDocumentedRoute("some/path/to/file.ts");
    expect(result).toBe(false);
  });

  it("should return false if an error occurs while reading the file", async () => {
    jest.spyOn(fs, "readFile").mockRejectedValue(new Error("File not found"));

    const result = await isDocumentedRoute("non/existent/path.ts");
    expect(result).toBe(false);
  });
});
