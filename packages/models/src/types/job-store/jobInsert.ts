import type z from "zod";
import type { insertJobRequestBodySchema, jobs } from "../../schemas";
import type { KeysMustMatch } from "./helper";

// ✅ エラーが出なければ一致
type Check = KeysMustMatch<RawInsertBody, ZodRawInsertBody>;
// drizzle の型推論（insert 型 or select 型）
type JobDrizzle = typeof jobs.$inferInsert;
type RawInsertBody = Omit<
  JobDrizzle,
  "id" | "createdAt" | "updatedAt" | "status"
>;
// Zod の型
type ZodRawInsertBody = InsertJobRequestBody;
// 一旦キーだけ比較してる
const check: Check = true;

export type InsertJobRequestBody = z.infer<typeof insertJobRequestBodySchema>;
