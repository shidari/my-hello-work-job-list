import type { Page } from "playwright";
import type z from "zod";
import type { ScrapedJobSchema } from "../../schemas";

const jobDetailPage = Symbol();
export type JobDetailPage = Page & { [jobDetailPage]: unknown };

export type ScrapedJob = z.infer<typeof ScrapedJobSchema>;
