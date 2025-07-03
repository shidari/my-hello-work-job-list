import type { Page } from "playwright";
import type { z } from "zod";
import type { JobInfoSchema } from "../schema";

export type JobInfo = z.infer<typeof JobInfoSchema>;
const jobDetailPage = Symbol();
export type JobDetailPage = Page & { [jobDetailPage]: unknown };
