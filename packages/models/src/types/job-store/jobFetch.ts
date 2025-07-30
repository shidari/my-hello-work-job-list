import type z from "zod";
import type { JobSchema } from "../../schemas";

export type Job = z.infer<typeof JobSchema>;
