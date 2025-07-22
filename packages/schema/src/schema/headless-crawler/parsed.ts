import { z } from "zod";
import {
  BrandedCompanyNameSchema,
  BrandedEmployeeCountSchema,
  BrandedEmploymentTypeSchema,
  BrandedExpiryDateSchema,
  BrandedHomePageSchema,
  BrandedJobDescriptionSchema,
  BrandedJobNumberSchema,
  BrandedOccupationSchema,
  BrandedQualificationsSchema,
  BrandedReceivedDateSchema,
  BrandedWageSchema,
  BrandedWorkPlaceSchema,
  BrandedWorkingHoursSchema,
  RawCompanyNameSchema,
  RawEmployeeCountSchema,
  RawEmploymentTypeSchema,
  RawExpiryDateSchema,
  RawHomePageSchema,
  RawJobDescriptionSchema,
  RawJobNumberSchema,
  RawOccupationSchema,
  RawQualificationsSchema,
  RawReceivedDateShema,
  RawWageSchema,
  RawWorkPlaceSchema,
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
  .transform((date) => date.toISOString());

export const ParsedExpiryDateSchema = RawExpiryDateSchema.transform((value) => {
  const dateStr = value.replace("年", "-").replace("月", "-").replace("日", "");
  return new Date(dateStr);
})
  .refine((date) => z.date().parse(date), "invalid date.")
  .transform((date) => date.toISOString());

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
}).refine((wage) =>
  z.object({ wageMin: z.number(), wageMax: z.number() }).parse(wage),
);
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
);

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

export const BrandedParsedExpiryDateSchema =
  ParsedExpiryDateSchema.brand("expiryDate(parsed)");
export const BrandedParsedWageSchema = ParsedWageSchema.brand("wage(parsed)");
export const BrandedParsedWorkingHoursSchema = ParsedWorkingHoursSchema.brand(
  "workingHours(parsed)",
);
export const BrandedParsedEmploymentCountSchema =
  ParsedEmploymentCountSchema.brand("employmentCount(parsed)");
export const BrandedParsedReceivedDateSchema = ParsedReceivedDateSchema.brand(
  "receivedDate(parsed)",
);

export const ScrapedJobSchema = z.object({
  jobNumber: BrandedJobNumberSchema,
  companyName: BrandedCompanyNameSchema,
  receivedDate: BrandedReceivedDateSchema,
  expiryDate: BrandedExpiryDateSchema,
  homePage: BrandedHomePageSchema.nullable(),
  occupation: BrandedOccupationSchema,
  employmentType: BrandedEmploymentTypeSchema,
  wage: BrandedWageSchema,
  workingHours: BrandedWorkingHoursSchema.optional(),
  employeeCount: BrandedEmployeeCountSchema,
  workPlace: BrandedWorkPlaceSchema,
  jobDescription: BrandedJobDescriptionSchema,
  qualifications: BrandedQualificationsSchema.nullable(),
});
