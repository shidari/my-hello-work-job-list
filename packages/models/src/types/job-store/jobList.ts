import type z from "zod";
import type { jobSelectSchema, jobs } from "../../schemas";
import type { KeysMustMatch } from "./helper";

type JobSelectFromDrizzle = typeof jobs.$inferSelect;

type JobSelectFromZod = z.infer<typeof jobSelectSchema>;

type Check = KeysMustMatch<JobSelectFromDrizzle, JobSelectFromZod>;
// 一旦キーだけ比較してる
const check: Check = true;
