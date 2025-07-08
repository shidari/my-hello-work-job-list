import { z } from "zod";
import { JobInfoSchema, JobSchema } from "../headless-crawler";
import { ISODateSchema } from "./../common";

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

export const JobInsertSuccessResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    job: JobSchema,
  }),
});
