import { JobInfoSchema } from "@sho/schema";
import type { Context } from "hono";
import z from "zod";
import type { jobs } from "./db/schema";

export type AppContext = Context<{ Bindings: Env }>;

const ISODateSchema = z
  .string()
  .refine((str) => !Number.isNaN(Date.parse(str)), {
    message: "有効なISO 8601日付ではありません",
  });

export const JobInsertBodySchema = JobInfoSchema.omit({
  wage: true,
  workingHours: true,
  receivedDate: true,
  expiryDate: true,
  employeeCount: true,
}).extend({
  wageMax: z.number(),
  wageMin: z.number(),
  workingStartTime: z.string(),
  workingEndTime: z.string(),
  receivedDate: ISODateSchema,
  expiryDate: ISODateSchema,
  employeeCount: z.number().int().nonnegative(),
});

export const JobSchema = JobInsertBodySchema.extend({
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.string(),
});
type JobInsertBodySchema = z.infer<typeof JobInsertBodySchema>;

type KeysMatch<T, U> = [keyof T] extends [keyof U]
  ? [keyof U] extends [keyof T]
    ? true
    : false
  : false;
type JobFromZod = z.infer<typeof JobSchema>;
export type JobFromDrizzle = typeof jobs.$inferSelect;

// エラーが出たら型不一致。一旦キーだけ比較する
const _check: true = false as KeysMatch<Omit<JobFromDrizzle, "id">, JobFromZod>;

export type JobForUI = Omit<
  typeof jobs.$inferSelect,
  | "id"
  | "createdAt"
  | "workingEndTime"
  | "workingStartTime"
  | "status"
  | "wageMax"
  | "wageMin"
> & { wage: string; workingHours: string };

export const JobSchemaForUI = JobSchema.omit({
  wageMax: true,
  wageMin: true,
  workingEndTime: true,
  workingStartTime: true,
  status: true,
}).extend({
  workingHours: z.string(),
  wage: z.string(),
});

export type NotFoundError = { type: "NotFound"; message: string };
export type ValidationError = { type: "Validation"; message: string };
export type InsertJobError = { type: "InsertJob"; message: string };

export type JobFetchError =
  | {
      type: "JobFetchFailed";
      message: string;
    }
  | {
      type: "JobFetchNotFound";
      message: string;
    };
