import { describe, expect, it } from "vitest";
import { transpile } from "./transpile";

describe("transpile", () => {
  it("should inject export fixers", () => {
    const result = transpile("", null);
    expect(result).toContain("exports.GET = void 0;");
    expect(result).toContain("exports.POST = void 0;");
    expect(result).toContain("exports.PUT = void 0;");
    expect(result).toContain("exports.PATCH = void 0;");
    expect(result).toContain("exports.DELETE = void 0;");
    // eslint-disable-next-line @stylistic/max-len
    expect(result).toContain("module.exports = { GET: exports.GET, POST: exports.POST, PUT: exports.PUT, PATCH: exports.PATCH, DELETE: exports.DELETE };");
  });

  it("should inject a placeholder function for the middleware", () => {
    const result = transpile("", "myAwesomeMiddleware");
    expect(result).toContain("const myAwesomeMiddleware = (handler) => handler;");
  });

  it("should strip types and emit CommonJS exports", () => {
    const result = transpile([
      "type Params = { id: string };",
      "export const GET = (p: Params): string => p.id satisfies string;",
    ].join("\n"), null);
    expect(result).not.toContain("type Params");
    expect(result).toContain("exports.GET =");
  });
});
