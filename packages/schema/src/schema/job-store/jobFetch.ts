import { z } from "zod";
import { JobSchemaForUI } from "../headless-crawler";

export const JobFetchParamSchema = z.object({
  jobNumber: z.string(),
});

export const JobFetchSuccessResponseSchema = z.object({
  job: JobSchemaForUI,
});

export const JobFetch404ResponseSchema = z.object({
  message: z.string(),
});
