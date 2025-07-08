import { z } from "zod";
import { JobSchemaForUI } from "../headless-crawler";

export const JobListQueryPageRawSchema = z.string().regex(/^\d+$/).optional();
export const JobQueryPageParsedSchema = JobListQueryPageRawSchema.transform(
  (strPage) => Number(strPage),
);

export const JobListQueryLimitRawSchema = z.string().regex(/^\d+$/).optional();
export const JobListQueryLimitParsedSchema =
  JobListQueryLimitRawSchema.transform((strLimit) => Number(strLimit));

export const JobListQueryParsedSchema = z.object({
  page: JobQueryPageParsedSchema,
  limit: JobListQueryLimitParsedSchema,
});

export const JobListSuccessResponseSchema = z.array(JobSchemaForUI);
export const JObList404ResponseSchema = z.object({
  message: z.string(),
});
