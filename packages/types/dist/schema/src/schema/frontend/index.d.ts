import type z from "zod";
export declare const JobOverviewSchema: z.ZodObject<
  {
    jobNumber: z.ZodString;
    companyName: z.ZodString;
    workPlace: z.ZodString;
    jobTitle: z.ZodString;
    employmentType: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    jobNumber: string;
    companyName: string;
    employmentType: string;
    workPlace: string;
    jobTitle: string;
  },
  {
    jobNumber: string;
    companyName: string;
    employmentType: string;
    workPlace: string;
    jobTitle: string;
  }
>;
export declare const JobDetailSchema: z.ZodObject<
  {
    jobNumber: z.ZodString;
    companyName: z.ZodString;
    workPlace: z.ZodString;
    jobTitle: z.ZodString;
    employmentType: z.ZodString;
  } & {
    salaly: z.ZodString;
    jobDescription: z.ZodString;
    expiryDate: z.ZodString;
    workingHours: z.ZodString;
    qualifications: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    jobNumber: string;
    companyName: string;
    employmentType: string;
    workPlace: string;
    jobDescription: string;
    qualifications: string;
    expiryDate: string;
    workingHours: string;
    jobTitle: string;
    salaly: string;
  },
  {
    jobNumber: string;
    companyName: string;
    employmentType: string;
    workPlace: string;
    jobDescription: string;
    qualifications: string;
    expiryDate: string;
    workingHours: string;
    jobTitle: string;
    salaly: string;
  }
>;
