import { describe, expect, it, jest } from "@jest/globals";
import { filterDirectoryItems, getDirectoryItems } from "./dir";
import generateOpenApiSpec from "./generateOpenApiSpec";
import { findAppFolderPath } from "./next";

jest.mock("./next");
jest.mock("./dir");

describe("generateOpenApiSpec", () => {
  it("should work", async () => {
    (findAppFolderPath as jest.Mock<() => Promise<string | null>>).mockResolvedValueOnce("src/app");
    (getDirectoryItems as jest.Mock<() => Promise<string[]>>).mockResolvedValueOnce([]);
    (filterDirectoryItems as jest.Mock<() => string[]>).mockReturnValueOnce([]);
    expect(await generateOpenApiSpec({})).not.toBeNull();
  });
});
