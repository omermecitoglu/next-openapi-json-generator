import { beforeEach, describe, expect, it, vi } from "vitest";
import * as utils from "./generateRandomString";
import { preserveStrings, restoreStrings } from "./string-preservation";

describe("preserveStrings", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should replace string values with placeholders and return the mapping of replacements", () => {
    vi.spyOn(utils, "generateRandomString").mockReturnValueOnce("RANDOM_GENERATED_STRING");

    const code = `
      console.log({
        description: "Initiates the process for resetting a user's password by sending a reset link to their registered email",
      });
    `;

    const output = preserveStrings(code);
    expect(output).toStrictEqual({
      output: `
      console.log({
        description: <@~RANDOM_GENERATED_STRING~@>,
      });
    `,
      replacements: {
        RANDOM_GENERATED_STRING: '"Initiates the process for resetting a user\'s password by sending a reset link to their registered email"',
      },
    });
  });
});

describe("restoreStrings", () => {
  it("should ...", () => {
    expect(typeof restoreStrings).toBe("function");
  });
});
