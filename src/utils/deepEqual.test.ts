import { describe, expect, it } from "@jest/globals";
import deepEqual from "./deepEqual";

describe("deepEqual", () => {
  it("should return true for identical primitive values", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual("string", "string")).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
  });

  it("should return false for different primitive values", () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual("string", "different")).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it("should return true for identical arrays", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual(["a", "b", "c"], ["a", "b", "c"])).toBe(true);
  });

  it("should return false for different arrays", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(deepEqual(["a", "b", "c"], ["a", "b", "d"])).toBe(false);
  });

  it("should return true for identical objects", () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(deepEqual({ a: "a", b: "b" }, { a: "a", b: "b" })).toBe(true);
  });

  it("should return false for different objects", () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    expect(deepEqual({ a: "a", b: "b" }, { a: "a", b: "c" })).toBe(false);
  });

  it("should return false for objects with different keys", () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
  });

  it("should return false for functions and symbols", () => {
    expect(deepEqual(() => null, () => null)).toBe(false);
    expect(deepEqual(Symbol("a"), Symbol("a"))).toBe(false);
  });

  it("should return true for identical nested objects", () => {
    expect(deepEqual({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true);
    expect(deepEqual({ a: { b: { c: 3 } } }, { a: { b: { c: 3 } } })).toBe(true);
  });

  it("should return false for different nested objects", () => {
    expect(deepEqual({ a: { b: 2 } }, { a: { b: 3 } })).toBe(false);
    expect(deepEqual({ a: { b: { c: 3 } } }, { a: { b: { c: 4 } } })).toBe(false);
  });

  it("should return true for identical nested arrays", () => {
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true);
  });

  it("should return false for different nested arrays", () => {
    expect(deepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
    expect(deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 5]])).toBe(false);
  });
});
