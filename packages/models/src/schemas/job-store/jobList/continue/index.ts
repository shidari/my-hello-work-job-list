// https://github.com/cloudflare/chanfana/issues/167#issue-2470366210
// queryでinternal server errorが出るので、zod-to-openapiを使う
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { jobListSearchFilterSchema } from "..";

extendZodWithOpenApi(z);

export const jobListContinueQuerySchema = z.object({
  nextToken: z.string(),
});

export const decodedNextTokenSchema = z.object({
  exp: z.number(),
  cursor: z.object({
    jobId: z.number(),
  }),
  filter: jobListSearchFilterSchema,
});

export const jobListContinueClientErrorResponseSchema = z.object({
  message: z.string(),
});

export const jobListContinueServerErrorSchema = z.object({
  message: z.string(),
});
