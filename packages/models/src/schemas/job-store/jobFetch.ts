import z from "zod";
import { jobNumberSchema } from "../headless-crawler";
import { jobSelectSchema } from "./drizzle";

export const jobFetchParamSchema = z.object({
  jobNumber: jobNumberSchema,
});

export const JobSchema = jobSelectSchema.omit({
  id: true,
});

export const jobFetchSuccessResponseSchema = JobSchema;

export const jobFetchClientErrorResponseSchema = z.object({
  message: z.string(),
});

export const jobFetchServerErrorSchema = z.object({
  message: z.string(),
});
