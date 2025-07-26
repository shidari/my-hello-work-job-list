import type * as z from "zod";
export declare const jobNumberSchema: z.ZodBranded<z.ZodString, "jobNumber">;
export declare const companyNameSchema: z.ZodBranded<
  z.ZodString,
  "companyName"
>;
export declare const homePageSchema: z.ZodBranded<z.ZodString, "homePage">;
export declare const occupationSchema: z.ZodBranded<z.ZodString, "occupation">;
export declare const employmentTypeSchema: z.ZodBranded<
  z.ZodEnum<["正社員", "パート労働者", "正社員以外", "有期雇用派遣労働者"]>,
  "employmentType"
>;
export declare const RawReceivedDateShema: z.ZodBranded<
  z.ZodString,
  "receivedDate(raw)"
>;
export declare const RawExpiryDateSchema: z.ZodBranded<
  z.ZodString,
  "expiryDate(raw)"
>;
export declare const RawWageSchema: z.ZodBranded<z.ZodString, "wage(raw)">;
export declare const RawWorkingHoursSchema: z.ZodBranded<
  z.ZodString,
  "workingHours(raw)"
>;
export declare const workPlaceSchema: z.ZodBranded<z.ZodString, "workPlace">;
export declare const jobDescriptionSchema: z.ZodBranded<
  z.ZodString,
  "jobDescription"
>;
export declare const qualificationsSchema: z.ZodBranded<
  z.ZodString,
  "qualifications"
>;
export declare const RawEmployeeCountSchema: z.ZodBranded<
  z.ZodString,
  "employeeCount(raw)"
>;
