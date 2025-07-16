import { describe, expect, it } from "vitest";
import clearUnusedSchemas from "./clearUnusedSchemas";

describe("clearUnusedSchemas", () => {
  it("should return the same input if there are no schemas", () => {
    const output = clearUnusedSchemas({ paths: {}, components: {} });
    expect(output).toStrictEqual({ paths: {}, components: {} });
  });

  it("should delete if a component was never used in any api routes", () => {
    const output = clearUnusedSchemas({
      paths: {
        "/user": {
          get: {
            summary: "Get user",
            responses: {
              200: {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
          Post: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
            },
          },
        },
      },
    });
    expect(output).toStrictEqual({
      paths: {
        "/user": {
          get: {
            summary: "Get user",
            responses: {
              200: {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
        },
      },
    });
  });

  it("should not mix the component names", () => {
    const output = clearUnusedSchemas({
      paths: {
        "/user/post": {
          get: {
            summary: "Get user post",
            responses: {
              200: {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/UserPost",
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
          UserPost: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
            },
          },
        },
      },
    });
    expect(output).toStrictEqual({
      paths: {
        "/user/post": {
          get: {
            summary: "Get user post",
            responses: {
              200: {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/UserPost",
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          UserPost: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
            },
          },
        },
      },
    });
  });

  it("should keep the schema if it was referenced by another schema", () => {
    const output = clearUnusedSchemas({
      paths: {
        "/user": {
          get: {
            summary: "Get user",
            responses: {
              200: {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              cars: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Car",
                },
              },
            },
          },
          Post: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
            },
          },
          Car: {
            type: "object",
            properties: {
              id: { type: "string" },
              model: { type: "string" },
            },
          },
        },
      },
    });
    expect(output).toStrictEqual({
      paths: {
        "/user": {
          get: {
            summary: "Get user",
            responses: {
              200: {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              cars: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Car",
                },
              },
            },
          },
          Car: {
            type: "object",
            properties: {
              id: { type: "string" },
              model: { type: "string" },
            },
          },
        },
      },
    });
  });
});
