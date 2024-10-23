import { describe, expect, it } from "@jest/globals";
import { detectMiddlewareName } from "./middleware";

describe("detectMiddlewareName", () => {
  it("should return the middleware name when present", () => {
    const code = "const config = { middleware: authMiddleware }";
    const result = detectMiddlewareName(code);
    expect(result).toBe("authMiddleware");
  });

  it("should return null when middleware name is not present", () => {
    const code = "const config = { handler: requestHandler }";
    const result = detectMiddlewareName(code);
    expect(result).toBeNull();
  });

  it("should return null when middleware key is present but no name is provided", () => {
    const code = "const config = { middleware: }";
    const result = detectMiddlewareName(code);
    expect(result).toBeNull();
  });

  it("should return the correct middleware name when there are multiple properties", () => {
    const code = "const config = { handler: requestHandler, middleware: loggingMiddleware, timeout: 5000 }";
    const result = detectMiddlewareName(code);
    expect(result).toBe("loggingMiddleware");
  });

  it("should handle code without spacing around the colon", () => {
    const code = "const config = { middleware:errorHandler }";
    const result = detectMiddlewareName(code);
    expect(result).toBe("errorHandler");
  });

  it("should handle code with different spacing around the colon", () => {
    const code = "const config = { middleware:  errorHandler }";
    const result = detectMiddlewareName(code);
    expect(result).toBe("errorHandler");
  });
});
