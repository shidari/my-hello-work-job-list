import type z from "zod";
export declare const insertJobRequestBodySchema: z.ZodObject<
  {
    jobNumber: z.ZodBranded<z.ZodString, "jobNumber">;
    companyName: z.ZodBranded<z.ZodString, "companyName">;
    homePage: z.ZodNullable<z.ZodBranded<z.ZodString, "homePage">>;
    occupation: z.ZodBranded<z.ZodString, "occupation">;
    employmentType: z.ZodBranded<
      z.ZodEnum<["正社員", "パート労働者", "正社員以外", "有期雇用派遣労働者"]>,
      "employmentType"
    >;
    workPlace: z.ZodBranded<z.ZodString, "workPlace">;
    jobDescription: z.ZodBranded<z.ZodString, "jobDescription">;
    qualifications: z.ZodNullable<z.ZodBranded<z.ZodString, "qualifications">>;
  } & {
    wageMin: z.ZodNumber;
    wageMax: z.ZodNumber;
    workingStartTime: z.ZodString;
    workingEndTime: z.ZodString;
    receivedDate: z.ZodString;
    expiryDate: z.ZodString;
    employeeCount: z.ZodNumber;
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
    receivedDate: string;
    expiryDate: string;
    employeeCount: number;
    wageMin: number;
    wageMax: number;
    workingStartTime: string;
    workingEndTime: string;
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
    employeeCount: number;
    wageMin: number;
    wageMax: number;
    workingStartTime: string;
    workingEndTime: string;
  }
>;
export declare const insertJobResponseBodySchema: z.ZodObject<
  {
    jobNumber: z.ZodBranded<z.ZodString, "jobNumber">;
    companyName: z.ZodBranded<z.ZodString, "companyName">;
    homePage: z.ZodNullable<z.ZodBranded<z.ZodString, "homePage">>;
    occupation: z.ZodBranded<z.ZodString, "occupation">;
    employmentType: z.ZodBranded<
      z.ZodEnum<["正社員", "パート労働者", "正社員以外", "有期雇用派遣労働者"]>,
      "employmentType"
    >;
    workPlace: z.ZodBranded<z.ZodString, "workPlace">;
    jobDescription: z.ZodBranded<z.ZodString, "jobDescription">;
    qualifications: z.ZodNullable<z.ZodBranded<z.ZodString, "qualifications">>;
  } & {
    wageMin: z.ZodNumber;
    wageMax: z.ZodNumber;
    workingStartTime: z.ZodString;
    workingEndTime: z.ZodString;
    receivedDate: z.ZodString;
    expiryDate: z.ZodString;
    employeeCount: z.ZodNumber;
  } & {
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    status: z.ZodString;
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
    receivedDate: string;
    expiryDate: string;
    employeeCount: number;
    status: string;
    wageMin: number;
    wageMax: number;
    workingStartTime: string;
    workingEndTime: string;
    createdAt: string;
    updatedAt: string;
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
    employeeCount: number;
    status: string;
    wageMin: number;
    wageMax: number;
    workingStartTime: string;
    workingEndTime: string;
    createdAt: string;
    updatedAt: string;
  }
>;
export declare const insertJobSuccessResponseSchema: z.ZodObject<
  {
    success: z.ZodLiteral<true>;
    result: z.ZodObject<
      {
        job: z.ZodObject<
          {
            jobNumber: z.ZodBranded<z.ZodString, "jobNumber">;
            companyName: z.ZodBranded<z.ZodString, "companyName">;
            homePage: z.ZodNullable<z.ZodBranded<z.ZodString, "homePage">>;
            occupation: z.ZodBranded<z.ZodString, "occupation">;
            employmentType: z.ZodBranded<
              z.ZodEnum<
                ["正社員", "パート労働者", "正社員以外", "有期雇用派遣労働者"]
              >,
              "employmentType"
            >;
            workPlace: z.ZodBranded<z.ZodString, "workPlace">;
            jobDescription: z.ZodBranded<z.ZodString, "jobDescription">;
            qualifications: z.ZodNullable<
              z.ZodBranded<z.ZodString, "qualifications">
            >;
          } & {
            wageMin: z.ZodNumber;
            wageMax: z.ZodNumber;
            workingStartTime: z.ZodString;
            workingEndTime: z.ZodString;
            receivedDate: z.ZodString;
            expiryDate: z.ZodString;
            employeeCount: z.ZodNumber;
          } & {
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            status: z.ZodString;
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
            receivedDate: string;
            expiryDate: string;
            employeeCount: number;
            status: string;
            wageMin: number;
            wageMax: number;
            workingStartTime: string;
            workingEndTime: string;
            createdAt: string;
            updatedAt: string;
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
            employeeCount: number;
            status: string;
            wageMin: number;
            wageMax: number;
            workingStartTime: string;
            workingEndTime: string;
            createdAt: string;
            updatedAt: string;
          }
        >;
      },
      "strip",
      z.ZodTypeAny,
      {
        job: {
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
          receivedDate: string;
          expiryDate: string;
          employeeCount: number;
          status: string;
          wageMin: number;
          wageMax: number;
          workingStartTime: string;
          workingEndTime: string;
          createdAt: string;
          updatedAt: string;
        };
      },
      {
        job: {
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
          employeeCount: number;
          status: string;
          wageMin: number;
          wageMax: number;
          workingStartTime: string;
          workingEndTime: string;
          createdAt: string;
          updatedAt: string;
        };
      }
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    success: true;
    result: {
      job: {
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
        receivedDate: string;
        expiryDate: string;
        employeeCount: number;
        status: string;
        wageMin: number;
        wageMax: number;
        workingStartTime: string;
        workingEndTime: string;
        createdAt: string;
        updatedAt: string;
      };
    };
  },
  {
    success: true;
    result: {
      job: {
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
        employeeCount: number;
        status: string;
        wageMin: number;
        wageMax: number;
        workingStartTime: string;
        workingEndTime: string;
        createdAt: string;
        updatedAt: string;
      };
    };
  }
>;
export declare const insertJobClientErrorResponseSchema: z.ZodObject<
  {
    message: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    message: string;
  },
  {
    message: string;
  }
>;
export declare const insertJobServerErrorResponseSchema: z.ZodObject<
  {
    message: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    message: string;
  },
  {
    message: string;
  }
>;
