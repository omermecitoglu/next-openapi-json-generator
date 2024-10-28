import { describe, expect, it } from "@jest/globals";
import isDocumentedRoute from "./isDocumentedRoute";

describe("isDocumentedRoute", () => {
  it("should exist", () => {
    expect(typeof isDocumentedRoute).toBe("function");
  });
});
