import z from "zod";
import { jobSelectSchema } from "./drizzle";

export const jobListQuerySchema = z.object({
  nextToken: z.string().optional(),
});

export const decodedNextTokenSchema = z.object({
  exp: z.number(),
  cursor: z.object({
    jobId: z.number(),
  }),
});

export const JobListSchema = z.array(
  jobSelectSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true,
  }),
);

export const jobListSuccessResponseSchema = JobListSchema;

export const jobListClientErrorResponseSchema = z.object({
  message: z.string(),
});

export const jobListServerErrorSchema = z.object({
  message: z.string(),
});
