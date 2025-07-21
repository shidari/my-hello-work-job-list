import * as z from "zod";
export const RawJobNumberSchema = z
  .string()
  .regex(/^\d{5}-\d{0,8}$/, "jobNumber format invalid.");
export const RawCompanyNameSchema = z.string();

export const RawHomePageSchema = z.string().url("home page should be url");
export const RawOccupationSchema = z
  .string()
  .min(1, "occupation should not be empty.");
export const RawEmploymentTypeSchema = z.enum([
  "正社員",
  "パート労働者",
  "正社員以外",
  "有期雇用派遣労働者",
]);

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
  .min(1, "workingHours should not be empty.");

export const RawWorkPlaceSchema = z.string();

export const RawJobDescriptionSchema = z.string();

export const RawQualificationsSchema = z.string();

export const RawEmployeeCountSchema = z.string();
