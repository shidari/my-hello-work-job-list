import type { JobInsertReqeustBody } from "@sho/schema";
import type z from "zod";
import type { jobs } from "./db/schema";
// drizzle の型推論（insert 型 or select 型）
type JobDrizzle = typeof jobs.$inferInsert;
type RawInsertBody = Omit<
  JobDrizzle,
  "id" | "createdAt" | "updatedAt" | "status"
>;
// Zod の型
type ZodRawInsertBody = JobInsertReqeustBody;

// 🔍 型チェック用ユーティリティ
type KeysMustMatch<A, B> = Exclude<keyof A, keyof B> extends never
  ? Exclude<keyof B, keyof A> extends never
    ? true
    : ["Extra keys in B:", Exclude<keyof B, keyof A>]
  : ["Extra keys in A:", Exclude<keyof A, keyof B>];

// ✅ エラーが出なければ一致
type Check = KeysMustMatch<RawInsertBody, ZodRawInsertBody>;

// 一旦キーだけ比較してる
const check: Check = true;
