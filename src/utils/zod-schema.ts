import type { ZodType } from "zod";

export function isFile(schema: ZodType<unknown>) {
  // Test that it accepts a File AND rejects a plain object
  const file = new File([], "nothing.txt");
  const plainObject = { name: "test", size: 0 };

  const fileResult = schema.safeParse(file);
  const objectResult = schema.safeParse(plainObject);

  // Should accept File but reject plain object (if it's truly a File schema)
  return fileResult.success && !objectResult.success;
}
