import z from "zod";
import { JobOverviewSchema } from "../../frontend";

export const jobOverviewListQuerySchema = z.object({
  nextToken: z.string().optional(),
});

export const jobOverviewListSuccessResponseSchema = z.object({
  jobs: z.array(JobOverviewSchema),
  nextToken: z.string().optional(),
});

export const jobOverviewListClientErrorResponseSchema = z.object({
  message: z.string(),
});

export const jobOverviewListServerErrorResponseSchema = z.object({
  message: z.string(),
});
