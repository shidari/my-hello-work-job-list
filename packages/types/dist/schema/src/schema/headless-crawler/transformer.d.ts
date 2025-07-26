import type z from "zod";
declare const r: unique symbol;
export type TransformedReceivedDate = string & {
  [r]: unknown;
};
declare const e: unique symbol;
export type TransformedExpiryDate = string & {
  [e]: unknown;
};
declare const ec: unique symbol;
export type TransformedEmployeeCount = number & {
  [ec]: unknown;
};
export declare const transformedReceivedDateSchema: z.ZodBranded<
  z.ZodEffects<z.ZodBranded<z.ZodString, "receivedDate(raw)">, string, string>,
  TransformedReceivedDate
>;
export declare const transformedExpiryDateSchema: z.ZodBranded<
  z.ZodEffects<z.ZodBranded<z.ZodString, "receivedDate(raw)">, string, string>,
  TransformedExpiryDate
>;
export declare const transformedWageSchema: z.ZodEffects<
  z.ZodEffects<
    z.ZodBranded<z.ZodString, "wage(raw)">,
    {
      wageMin: number;
      wageMax: number;
    },
    string
  >,
  {
    wageMin: number;
    wageMax: number;
  },
  string
>;
export declare const transformedWorkingHoursSchema: z.ZodEffects<
  z.ZodBranded<z.ZodString, "workingHours(raw)">,
  {
    workingStartTime: string;
    workingEndTime: string;
  },
  string
>;
export declare const transformedEmployeeCountSchema: z.ZodBranded<
  z.ZodPipeline<
    z.ZodEffects<
      z.ZodBranded<z.ZodString, "employeeCount(raw)">,
      number,
      string
    >,
    z.ZodNumber
  >,
  TransformedEmployeeCount
>;
