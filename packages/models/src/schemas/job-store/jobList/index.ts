// https://github.com/cloudflare/chanfana/issues/167#issue-2470366210
// queryでinternal server errorが出るので、zod-to-openapiを使う
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { jobSelectSchema } from "../drizzle";

extendZodWithOpenApi(z);

export const searchFilterSchema = z.object({
  companyName: z.string().optional(),
  employeeCountLt: z.number().optional(),
  employeeCountGt: z.number().optional(),
  jobDescription: z.string().optional(),
  jobDescriptionExclude: z.string().optional(), // 除外キーワード
  onlyNotExpired: z.boolean().optional(),
});

export const jobListQuerySchema = searchFilterSchema;

export const jobListSearchFilterSchema = searchFilterSchema;

export const JobListSchema = z.array(
  jobSelectSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true,
  }),
);

export const jobListSuccessResponseSchema = z.object({
  jobs: JobListSchema,
  nextToken: z.string().optional(),
  meta: z.object({
    totalCount: z.number(),
  }),
});

export const jobListClientErrorResponseSchema = z.object({
  message: z.string(),
});

export const jobListServerErrorSchema = z.object({
  message: z.string(),
});
