import { z } from "zod";
import { ISODateSchema } from "../job-store";
import {
  JobInfoSchema,
  RawEmployeeCountSchema,
  RawExpiryDateSchema,
  RawReceivedDateShema,
  RawWageSchema,
  RawWorkingHoursSchema,
} from "./raw";

export const ParsedReceivedDateSchema = RawReceivedDateShema.transform(
  (value) => {
    const dateStr = value
      .replace("年", "-")
      .replace("月", "-")
      .replace("日", "");
    return new Date(dateStr);
  },
)
  .refine((date) => z.date().parse(date), "invalid date.")
  .transform((date) => date.toISOString())
  .brand<"ReceivedDateShema">();
export const ParsedExpiryDateSchema = RawExpiryDateSchema.transform((value) => {
  const dateStr = value.replace("年", "-").replace("月", "-").replace("日", "");
  return new Date(dateStr);
})
  .refine((date) => z.date().parse(date), "invalid date.")
  .transform((date) => date.toISOString())
  .brand<"ExpiryDateSchema">();
export const ParsedWageSchema = RawWageSchema.transform((value) => {
  // 直接正規表現を使って上限と下限を抽出し、数値に変換
  const match = value.match(/^(\d{1,3}(?:,\d{3})*)円〜(\d{1,3}(?:,\d{3})*)円$/);

  if (!match) {
    throw new Error("Invalid wage format");
  }

  // 数字のカンマを削除してから数値に変換
  const wageMin = Number.parseInt(match[1].replace(/,/g, ""), 10);
  const wageMax = Number.parseInt(match[2].replace(/,/g, ""), 10);
  return { wageMin, wageMax }; // 上限と下限の数値オブジェクトを返す
})
  .refine((wage) =>
    z.object({ wageMin: z.number(), wageMax: z.number() }).parse(wage),
  )
  .brand<"WageSchema">();
export const ParsedWorkingHoursSchema = RawWorkingHoursSchema.transform(
  (value) => {
    if (!value)
      return { workingStartTime: undefined, workingEndTime: undefined };
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
).brand<"WorkingHoursSchema">();

export const ParsedEmploymentCountSchema = RawEmployeeCountSchema.transform(
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
).pipe(
  z
    .number({
      invalid_type_error: "Failed to convert to a number",
    })
    .int("Must be an integer")
    .nonnegative("Must be a non-negative number"),
);
export const JobSchema = JobInfoSchema.omit({
  wage: true,
  workingHours: true,
  receivedDate: true,
  expiryDate: true,
  employeeCount: true,
}).extend({
  wageMax: z.number(),
  wageMin: z.number(),
  workingStartTime: z.string().optional(),
  workingEndTime: z.string().optional(),
  receivedDate: ISODateSchema,
  expiryDate: ISODateSchema,
  employeeCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.string(),
});

export const JobSchemaForUI = JobSchema.omit({
  wageMax: true,
  wageMin: true,
  workingEndTime: true,
  workingStartTime: true,
  status: true,
}).extend({
  workingHours: z.string(),
  wage: z.string(),
});
