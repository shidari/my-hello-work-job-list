import type { JobSchema } from "@sho/schema";
import type { Context } from "hono";
import type z from "zod";
import type { jobs } from "./db/schema";

export type AppContext = Context<{ Bindings: Env }>;

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
