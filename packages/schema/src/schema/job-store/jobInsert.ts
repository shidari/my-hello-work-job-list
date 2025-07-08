import { z } from "zod";
import { JobInfoSchema, JobSchema } from "../headless-crawler";

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
  workingStartTime: z.string().optional(),
  workingEndTime: z.string().optional(),
  receivedDate: ISODateSchema,
  expiryDate: ISODateSchema,
  employeeCount: z.number().int().nonnegative(),
});
console.log(
  `JobInsertBodySchema: ${JSON.stringify(JobInsertBodySchema, null, 2)}`,
);

export const JobInsertSuccessResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    job: JobSchema,
  }),
});
