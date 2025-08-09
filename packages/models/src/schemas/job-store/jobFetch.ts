// https://github.com/cloudflare/chanfana/issues/167#issue-2470366210
// paramでinternal server errorが出るので、zod-to-openapiを使う
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { jobNumberSchema } from "../headless-crawler";
import { jobSelectSchema } from "./drizzle";

extendZodWithOpenApi(z);

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
