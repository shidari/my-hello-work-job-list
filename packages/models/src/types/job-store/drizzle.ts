import type z from "zod";
import type { jobSelectSchema, jobs } from "../../schemas";

// 🔍 型チェック用ユーティリティ
export type KeysMustMatch<A, B> = Exclude<keyof A, keyof B> extends never
  ? Exclude<keyof B, keyof A> extends never
    ? true
    : ["Extra keys in B:", Exclude<keyof B, keyof A>]
  : ["Extra keys in A:", Exclude<keyof A, keyof B>];

type JobSelectFromDrizzle = typeof jobs.$inferSelect;

type JobSelectFromZod = z.infer<typeof jobSelectSchema>;

type Check = KeysMustMatch<JobSelectFromDrizzle, JobSelectFromZod>;
// 一旦キーだけ比較してる
const check: Check = true;
