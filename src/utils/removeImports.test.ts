import { describe, expect, it } from "@jest/globals";
import removeImports from "./removeImports";

describe("removeImports", () => {
  it("removes a default import", () => {
    const code = 'import defaultExport from "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes a namespace import", () => {
    const code = 'import * as name from "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes a named import", () => {
    const code = 'import { export1 } from "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes a named import with alias", () => {
    const code = 'import { export1 as alias1 } from "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes a default import with alias", () => {
    const code = 'import { default as alias } from "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes multiple named imports", () => {
    const code = 'import { export1, export2 } from "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes multiple named imports with alias", () => {
    const code = 'import { export1, export2 as alias2 } from "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes a named import with a string alias", () => {
    const code = 'import { "string name" as alias } from "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes a combined default and named import", () => {
    const code = 'import defaultExport, { export1 } from "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes a combined default and namespace import", () => {
    const code = 'import defaultExport, * as name from "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes a side-effect only import", () => {
    const code = 'import "module-name";';
    expect(removeImports(code)).toBe("");
  });

  it("removes a default import with single quotes", () => {
    const code = "import defaultExport from 'module-name';";
    expect(removeImports(code)).toBe("");
  });

  it("removes a default import missing semicolon", () => {
    const code = 'import defaultExport from "module-name"';
    expect(removeImports(code)).toBe("");
  });

  it("removes a multiline named import", () => {
    const code = [
      "import {",
      "  myAwesomeFunction",
      '} from "my-awesome-module";',
    ];
    expect(removeImports(code.join("\n"))).toBe("");
  });
});
