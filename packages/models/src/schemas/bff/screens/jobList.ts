import z from "zod";
import { JobOverviewSchema } from "../../frontend";

export const jobListQuerySchema = z.object({
  nextToken: z.string().optional(),
});

export const jobListSuccessResponseSchema = z.object({
  jobs: z.array(JobOverviewSchema),
  nextToken: z.string().optional(),
});

export const jobListClientErrorResponseSchema = z.object({
  message: z.string(),
});

export const jobListServerErrorResponseSchema = z.object({
  message: z.string(),
});
