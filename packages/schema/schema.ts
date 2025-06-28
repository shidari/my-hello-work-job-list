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
  .brand<"ReceivedDateShema">();
export const ExpiryDateSchema = z
  .string()
  .regex(
    /^\d{4}年\d{1,2}月\d{1,2}日$/,
    "expiry date format invalid. should be yyyy年mm月dd日",
  )
  .brand<"ExpiryDateSchema">();
export const HomePageSchema = z.string().url("home page should be url");
export const OccupationSchema = z
  .string()
  .min(1, "occupation should not be empty.")
  .brand<"OccupationSchema">();
export const EmploymentTypeSchema = z
  .string()
  .min(1, "employment type should not be empty.")
  .brand<"EmploymentTypeSchema">();
export const WageSchema = z
  .string()
  .min(1, "wage should not be empty")
  .brand<"WageSchema">();
export const WorkingHoursSchema = z
  .string()
  .min(1, "workingHours should not be empty.")
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
