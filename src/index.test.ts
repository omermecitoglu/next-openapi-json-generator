import { describe, expect, it } from "vitest";
import generateOpenApiSpec from ".";

describe("generateOpenApiSpec", () => {
  it("must be a function", () => {
    expect(typeof generateOpenApiSpec).toBe("function");
  });
});
