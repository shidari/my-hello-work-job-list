import z from "zod";
import { JobDetailSchema, JobOverviewSchema } from "../../frontend";
import { jobNumberSchema } from "../../headless-crawler";

export const jobNumberParamSchema = jobNumberSchema;

export const jobSuccessResponseSchema = JobDetailSchema;

export const jobClientErrorResponseSchema = z.object({
  message: z.string(),
});

export const jobServerErrorResponseSchema = z.object({
  message: z.string(),
});
