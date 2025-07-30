import type z from "zod";
import type { JobListSchema } from "../../schemas";

export type JobList = z.infer<typeof JobListSchema>;
