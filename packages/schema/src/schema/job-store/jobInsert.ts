import { Bool } from "chanfana";
import z from "zod";
import { JobSchema } from "../headless-crawler";

export const JobInsertSuccessResponseSchema = z.object({
  success: Bool(),
  result: z.object({
    job: JobSchema,
  }),
});
