import { describe, expect, it } from "@jest/globals";
import { transpile } from "./transpile";

describe("transpile", () => {
  it("should inject export fixers", () => {
    const result = transpile("", "defineRoute", null);
    expect(result).toContain("exports.GET = void 0;");
    expect(result).toContain("exports.POST = void 0;");
    expect(result).toContain("exports.PUT = void 0;");
    expect(result).toContain("exports.PATCH = void 0;");
    expect(result).toContain("exports.DELETE = void 0;");
    // eslint-disable-next-line @stylistic/max-len
    expect(result).toContain("module.exports = { GET: exports.GET, POST: exports.POST, PUT: exports.PUT, PATCH: exports.PATCH, DELETE: exports.DELETE };");
  });

  it("should inject '@omer-x/next-openapi-route-handler' while it is necessary", async () => {
    const repoName = "omermecitoglu/example-user-service";
    const branchName = "main";
    const filePath = "src/app/users/route.ts";
    const response = await fetch(`https://raw.githubusercontent.com/${repoName}/refs/heads/${branchName}/${filePath}`);
    const example = await response.text();
    const result = transpile(example, "defineRoute", null);
    expect(result).toContain("require(\"@omer-x/next-openapi-route-handler\");");
  });

  it("should not inject '@omer-x/next-openapi-route-handler' while it is not necessary", () => {
    const result = transpile("", "defineRoute", null);
    expect(result).not.toContain("require(\"@omer-x/next-openapi-route-handler\");");
  });

  it("should inject 'zod' while it is necessary", () => {
    const rawCodeExample = `
      import z from "zod";

      const schema = z.object({
        name: z.string().min(3).max(255).optional(),
      });
    `;
    const result = transpile(rawCodeExample, "defineRoute", null);
    expect(result).toContain("require(\"zod\");");
  });

  it("should not inject 'zod' while it is not necessary", () => {
    const result = transpile("", "defineRoute", null);
    expect(result).not.toContain("require(\"zod\");");
  });

  it("should inject a placeholder function for the middleware", () => {
    const result = transpile("", "defineRoute", "myAwesomeMiddleware");
    expect(result).toContain("var myAwesomeMiddleware = function (handler) { return handler; };");
  });
});
