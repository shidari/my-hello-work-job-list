import type z from "zod";
import type { decodedNextTokenSchema, JobListSchema } from "../../schemas";

export type JobList = z.infer<typeof JobListSchema>;

export type DecodedNextToken = z.infer<typeof decodedNextTokenSchema>;
