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
export declare const ScrapedJobSchema: z.ZodObject<
  {
    jobNumber: z.ZodBranded<z.ZodString, "jobNumber">;
    companyName: z.ZodBranded<z.ZodString, "companyName">;
    receivedDate: z.ZodBranded<z.ZodString, "receivedDate(raw)">;
    expiryDate: z.ZodBranded<z.ZodString, "expiryDate(raw)">;
    homePage: z.ZodNullable<z.ZodBranded<z.ZodString, "homePage">>;
    occupation: z.ZodBranded<z.ZodString, "occupation">;
    employmentType: z.ZodBranded<
      z.ZodEnum<["正社員", "パート労働者", "正社員以外", "有期雇用派遣労働者"]>,
      "employmentType"
    >;
    employeeCount: z.ZodBranded<z.ZodString, "employeeCount(raw)">;
    wage: z.ZodBranded<z.ZodString, "wage(raw)">;
    workingHours: z.ZodBranded<z.ZodString, "workingHours(raw)">;
    workPlace: z.ZodBranded<z.ZodString, "workPlace">;
    jobDescription: z.ZodBranded<z.ZodString, "jobDescription">;
    qualifications: z.ZodNullable<z.ZodBranded<z.ZodString, "qualifications">>;
  },
  "strip",
  z.ZodTypeAny,
  {
    jobNumber: string & z.BRAND<"jobNumber">;
    companyName: string & z.BRAND<"companyName">;
    homePage: (string & z.BRAND<"homePage">) | null;
    occupation: string & z.BRAND<"occupation">;
    employmentType: (
      | "正社員"
      | "パート労働者"
      | "正社員以外"
      | "有期雇用派遣労働者"
    ) &
      z.BRAND<"employmentType">;
    workPlace: string & z.BRAND<"workPlace">;
    jobDescription: string & z.BRAND<"jobDescription">;
    qualifications: (string & z.BRAND<"qualifications">) | null;
    receivedDate: string & z.BRAND<"receivedDate(raw)">;
    expiryDate: string & z.BRAND<"expiryDate(raw)">;
    employeeCount: string & z.BRAND<"employeeCount(raw)">;
    wage: string & z.BRAND<"wage(raw)">;
    workingHours: string & z.BRAND<"workingHours(raw)">;
  },
  {
    jobNumber: string;
    companyName: string;
    homePage: string | null;
    occupation: string;
    employmentType:
      | "正社員"
      | "パート労働者"
      | "正社員以外"
      | "有期雇用派遣労働者";
    workPlace: string;
    jobDescription: string;
    qualifications: string | null;
    receivedDate: string;
    expiryDate: string;
    employeeCount: string;
    wage: string;
    workingHours: string;
  }
>;
