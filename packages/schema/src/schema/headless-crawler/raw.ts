import * as z from "zod";
export const jobNumberSchema = z
  .string()
  .regex(/^\d{5}-\d{0,8}$/, "jobNumber format invalid.")
  .brand("jobNumber");
export const companyNameSchema = z.string().brand("companyName");

export const homePageSchema = z
  .string()
  .url("home page should be url")
  .brand("homePage");
export const occupationSchema = z
  .string()
  .min(1, "occupation should not be empty.")
  .brand("occupation");
export const employmentTypeSchema = z
  .enum(["正社員", "パート労働者", "正社員以外", "有期雇用派遣労働者"])
  .brand("employmentType");

export const RawReceivedDateShema = z
  .string()
  .regex(
    /^\d{4}年\d{1,2}月\d{1,2}日$/,
    "received date format invalid. should be yyyy年mm月dd日",
  )
  .brand("receivedDate(raw)");

export const RawExpiryDateSchema = z
  .string()
  .regex(
    /^\d{4}年\d{1,2}月\d{1,2}日$/,
    "expiry date format invalid. should be yyyy年mm月dd日",
  )
  .brand("expiryDate(raw)");

export const RawWageSchema = z
  .string()
  .min(1, "wage should not be empty")
  .brand("wage(raw)");

export const RawWorkingHoursSchema = z
  .string()
  .min(1, "workingHours should not be empty.")
  .brand("workingHours(raw)");

export const workPlaceSchema = z.string().brand("workPlace");

export const jobDescriptionSchema = z.string().brand("jobDescription");

export const qualificationsSchema = z.string().brand("qualifications");

export const RawEmployeeCountSchema = z.string().brand("employeeCount(raw)");
