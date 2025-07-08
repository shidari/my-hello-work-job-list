import * as z from "zod";
export const JobNumberSchema = z
  .string()
  .regex(/^\d{5}-\d{0,8}$/, "jobNumber format invalid.")
  .brand<"JobNumber">();
export const CompanyNameSchema = z.string().brand<"CompanyNameSchema">();

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

export const RawReceivedDateShema = z
  .string()
  .regex(
    /^\d{4}年\d{1,2}月\d{1,2}日$/,
    "received date format invalid. should be yyyy年mm月dd日",
  );

export const RawExpiryDateSchema = z
  .string()
  .regex(
    /^\d{4}年\d{1,2}月\d{1,2}日$/,
    "expiry date format invalid. should be yyyy年mm月dd日",
  );

export const RawWageSchema = z.string().min(1, "wage should not be empty");

export const RawWorkingHoursSchema = z
  .string()
  .min(1, "workingHours should not be empty.")
  .optional();

export const RawEmployeeCountSchema = z.string();

export const JobInfoSchema = z.object({
  jobNumber: JobNumberSchema,
  companyName: CompanyNameSchema,
  receivedDate: RawReceivedDateShema,
  expiryDate: RawExpiryDateSchema,
  homePage: HomePageSchema,
  occupation: OccupationSchema,
  employmentType: EmploymentTypeSchema,
  wage: RawWageSchema,
  workingHours: RawWorkingHoursSchema,
  employeeCount: RawEmployeeCountSchema,
});
