import { describe, expect, it } from "@jest/globals";
import { transpile } from "./transpile";

describe("transpile", () => {
  it("should inject export fixers", () => {
    const result = transpile("", "defineRoute");
    expect(result).toContain("exports.GET = void 0;");
    expect(result).toContain("exports.POST = void 0;");
    expect(result).toContain("exports.PUT = void 0;");
    expect(result).toContain("exports.PATCH = void 0;");
    expect(result).toContain("exports.DELETE = void 0;");
    // eslint-disable-next-line @stylistic/max-len
    expect(result).toContain("module.exports = { GET: exports.GET, POST: exports.POST, PUT: exports.PUT, PATCH: exports.PATCH, DELETE: exports.DELETE };");
  });

  it("should inject '@omer-x/next-openapi-route-handler' while it is necessary", () => {
    const rawCodeExample = `
      import defineRoute from "@omer-x/next-openapi-route-handler";
      import z from "zod";
      import db from "~/database";
      import { NewUserDTO, UserDTO } from "~/models/user";
      import createUser from "~/operations/createUser";
      import getUsers from "~/operations/getUsers";

      export const { GET } = defineRoute({
        operationId: "getUsers",
        method: "GET",
        summary: "Get all users",
        description: "Retrieve a list of users",
        tags: ["Users"],
        queryParams: z.object({
          select: UserDTO.keyof().array().default([])
            .describe("List of the column names"),
        }),
        action: async ({ queryParams }) => {
          return Response.json(await getUsers(db, queryParams.select));
        },
        responses: {
          200: { description: "Returns a list of users", content: UserDTO, isArray: true },
        },
      });

      export const { POST } = defineRoute({
        operationId: "createUser",
        method: "POST",
        summary: "Create user",
        description: "Create a new user",
        tags: ["Users"],
        requestBody: NewUserDTO,
        action: async ({ body }) => {
          const user = await createUser(db, body);
          return Response.json(user, { status: 201 });
        },
        responses: {
          201: { description: "User created successfully", content: UserDTO },
          409: { description: "Email already exists" },
        },
      });
    `;
    const result = transpile(rawCodeExample, "defineRoute");
    expect(result).toContain("require(\"@omer-x/next-openapi-route-handler\");");
  });

  it("should not inject '@omer-x/next-openapi-route-handler' while it is not necessary", () => {
    const result = transpile("", "defineRoute");
    expect(result).not.toContain("require(\"@omer-x/next-openapi-route-handler\");");
  });

  it("should inject 'zod' while it is necessary", () => {
    const rawCodeExample = `
      import z from "zod";

      const schema = z.object({
        name: z.string().min(3).max(255).optional(),
      });
    `;
    const result = transpile(rawCodeExample, "defineRoute");
    expect(result).toContain("require(\"zod\");");
  });

  it("should not inject 'zod' while it is not necessary", () => {
    const result = transpile("", "defineRoute");
    expect(result).not.toContain("require(\"zod\");");
  });
});
