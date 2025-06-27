import { z } from "zod";

export const receivedDate = z.string().regex(/^\d{4}年\d{1,2}月\d{1,2}日$/);

export const homePage = z.string().url();

export const employeeCountSchema = z
  .string()
  .transform((val, ctx) => {
    const match = val.match(/\d+/);
    if (!match) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No numeric value found",
      });
      return z.NEVER;
    }
    return Number(match[0]);
  })
  .pipe(
    z
      .number({
        invalid_type_error: "Failed to convert to a number",
      })
      .int("Must be an integer")
      .nonnegative("Must be a non-negative number"),
  );
