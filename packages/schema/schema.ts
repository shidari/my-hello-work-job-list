import { z } from "zod";

export const JobNumberSchema = z
  .string()
  .regex(/^\d{5}-\d{0,8}$/, "jobNumber format invalid.")
  .brand<"JobNumber">();
export const CompanyNameSchema = z.string().brand<"CompanyNameSchema">();
export const ReceivedDateShema = z
  .string()
  .regex(
    /^\d{4}年\d{1,2}月\d{1,2}日$/,
    "received date format invalid. should be yyyy年mm月dd日",
  )
  .transform((value) => {
    const dateStr = value
      .replace("年", "-")
      .replace("月", "-")
      .replace("日", "");
    return new Date(dateStr);
  })
  .refine((date) => z.date().parse(date), "invalid date.")
  .transform((date) => date.toISOString())
  .brand<"ReceivedDateShema">();
export const ExpiryDateSchema = z
  .string()
  .regex(
    /^\d{4}年\d{1,2}月\d{1,2}日$/,
    "expiry date format invalid. should be yyyy年mm月dd日",
  )
  .transform((value) => {
    const dateStr = value
      .replace("年", "-")
      .replace("月", "-")
      .replace("日", "");
    return new Date(dateStr);
  })
  .refine((date) => z.date().parse(date), "invalid date.")
  .transform((date) => date.toISOString())
  .brand<"ExpiryDateSchema">();
export const HomePageSchema = z
  .string()
  .url("home page should be url")
  .nullable();
export const OccupationSchema = z
  .string()
  .min(1, "occupation should not be empty.")
  .brand<"OccupationSchema">();
export const EmploymentTypeSchema = z
  .enum(["正社員", "パート労働者", "正社員以外", "有期雇用派遣労働者"])
  .brand<"EmploymentTypeSchema">();
export const WageSchema = z
  .string()
  .min(1, "wage should not be empty")
  .transform((value) => {
    // 直接正規表現を使って上限と下限を抽出し、数値に変換
    const match = value.match(
      /^(\d{1,3}(?:,\d{3})*)円〜(\d{1,3}(?:,\d{3})*)円$/,
    );

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
export const WorkingHoursSchema = z
  .string()
  .min(1, "workingHours should not be empty.")
  .transform((value) => {
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
  })
  .brand<"WorkingHoursSchema">();
export const EmployeeCountSchema = z
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

export const JobInfoSchema = z.object({
  jobNumber: JobNumberSchema,
  companyName: CompanyNameSchema,
  receivedDate: ReceivedDateShema,
  expiryDate: ExpiryDateSchema,
  homePage: HomePageSchema,
  occupation: OccupationSchema,
  employmentType: EmploymentTypeSchema,
  wage: WageSchema,
  workingHours: WorkingHoursSchema,
  employeeCount: EmployeeCountSchema,
});

export const ISODateSchema = z
  .string()
  .refine((str) => !Number.isNaN(Date.parse(str)), {
    message: "有効なISO 8601日付ではありません",
  });

export const JobInsertBodySchema = JobInfoSchema.omit({
  wage: true,
  workingHours: true,
  receivedDate: true,
  expiryDate: true,
  employeeCount: true,
}).extend({
  wageMax: z.number(),
  wageMin: z.number(),
  workingStartTime: z.string(),
  workingEndTime: z.string(),
  receivedDate: ISODateSchema,
  expiryDate: ISODateSchema,
  employeeCount: z.number().int().nonnegative(),
});

export const JobSchema = JobInsertBodySchema.extend({
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.string(),
});
export type JobInsertBodySchema = z.infer<typeof JobInsertBodySchema>;

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
