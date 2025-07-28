import z from "zod";
import {
  RawEmployeeCountSchema,
  RawReceivedDateShema,
  RawWageSchema,
  RawWorkingHoursSchema,
} from "./raw";

const r = Symbol();
export type TransformedReceivedDate = string & { [r]: unknown };
const e = Symbol();
export type TransformedExpiryDate = string & { [e]: unknown };
const ec = Symbol();
export type TransformedEmployeeCount = number & { [ec]: unknown };

export const transformedReceivedDateSchema = RawReceivedDateShema.transform(
  (value) => {
    // "2025年7月23日" → "2025-07-23"
    const dateStr = value
      .replace("年", "-")
      .replace("月", "-")
      .replace("日", "");

    const isoDate = new Date(dateStr).toISOString();
    return isoDate;
  },
).brand<TransformedReceivedDate>();
export const transformedExpiryDateSchema = RawReceivedDateShema.transform(
  (value) => {
    // "2025年7月23日" → "2025-07-23"
    const dateStr = value
      .replace("年", "-")
      .replace("月", "-")
      .replace("日", "");

    const isoDate = new Date(dateStr).toISOString();
    return isoDate;
  },
).brand<TransformedExpiryDate>();

export const transformedWageSchema = RawWageSchema.transform((value) => {
  // 直接正規表現を使って上限と下限を抽出し、数値に変換
  const match = value.match(/^(\d{1,3}(?:,\d{3})*)円〜(\d{1,3}(?:,\d{3})*)円$/);

  if (!match) {
    throw new Error("Invalid wage format");
  }

  // 数字のカンマを削除してから数値に変換
  const wageMin = Number.parseInt(match[1].replace(/,/g, ""), 10);
  const wageMax = Number.parseInt(match[2].replace(/,/g, ""), 10);
  return { wageMin, wageMax }; // 上限と下限の数値オブジェクトを返す
}).refine((wage) =>
  z.object({ wageMin: z.number(), wageMax: z.number() }).parse(wage),
);

export const transformedWorkingHoursSchema = RawWorkingHoursSchema.transform(
  (value) => {
    const match = value.match(
      /^(\d{1,2})時(\d{1,2})分〜(\d{1,2})時(\d{1,2})分$/,
    );
    if (!match) {
      throw new Error("Invalid format, should be '9時00分〜18時00分'");
    }

    const [_, startH, startM, endH, endM] = match;

    const workingStartTime = `${startH.padStart(2, "0")}:${startM.padStart(2, "0")}:00`;
    const workingEndTime = `${endH.padStart(2, "0")}:${endM.padStart(2, "0")}:00`;

    return { workingStartTime, workingEndTime };
  },
);

export const transformedEmployeeCountSchema = RawEmployeeCountSchema.transform(
  (val, ctx) => {
    const match = val.match(/\d+/);
    if (!match) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No numeric value found",
      });
      return z.NEVER;
    }
    return Number(match[0]);
  },
)
  .pipe(
    z
      .number({
        invalid_type_error: "Failed to convert to a number",
      })
      .int("Must be an integer")
      .nonnegative("Must be a non-negative number"),
  )
  .brand<TransformedEmployeeCount>();
