import { describe, expect, it } from "@jest/globals";
import injectSchemas from "./injectSchemas";

describe("injectSchemas", () => {
  it("should inject the schema name into the code", () => {
    const code = `
      const { GET } = defineRoute({
        requestBody: User,
      });
    `;
    const output = injectSchemas(code, "User");
    expect(output).toBe(`
      const { GET } = defineRoute({
        requestBody: "User",
      });
    `);
  });

  it("should handle zod helper functions", () => {
    const code = `
      const { GET } = defineRoute({
        requestBody: User.pick({ id: true }),
      });
    `;
    const output = injectSchemas(code, "User");
    expect(output).toBe(`
      const { GET } = defineRoute({
        requestBody: global.schemas["User"].pick({ id: true }),
      });
    `);
  });

  it("should leave the strings alone", () => {
    const code = `
      const { GET } = defineRoute({
        requestBody: User.pick({ id: true }),
        responses: {
          200: { description: "User. found", content: User },
          400: { description: 'Bad Request' },
          404: { description: \`User not found\` }
        },
      });
    `;
    const output = injectSchemas(code, "User");
    expect(output).toBe(`
      const { GET } = defineRoute({
        requestBody: global.schemas["User"].pick({ id: true }),
        responses: {
          200: { description: "User. found", content: "User" },
          400: { description: 'Bad Request' },
          404: { description: \`User not found\` }
        },
      });
    `);
  });
});
