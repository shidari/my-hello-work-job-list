import type { InsertJobRequestBody } from "@sho/models";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { Context, Effect, Layer } from "effect";
import { jobs } from "./db/schema";
import {
  InsertJobDuplicationError,
  InsertJobError,
} from "./endpoint/jobInsert/error";

export class JobStoreClient extends Context.Tag("JobStoreClient")<
  JobStoreClient,
  {
    readonly insertJob: (
      job: InsertJobRequestBody,
    ) => Effect.Effect<
      InsertJobRequestBody,
      InsertJobDuplicationError | InsertJobError
    >;
    readonly checkDuplicate: (
      jobNumber: string,
    ) => Effect.Effect<boolean, InsertJobDuplicationError>;
  }
>() {}

function buildJobStoreClientLive(
  db: DrizzleD1Database<Record<string, never>> & {
    $client: D1Database;
  },
) {
  return Effect.succeed({
    insertJob: (job: InsertJobRequestBody) =>
      Effect.tryPromise({
        try: () => {
          const now = new Date();
          const insertingValues = {
            ...job,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            status: "active",
          };
          return db.insert(jobs).values(insertingValues);
        },
        catch: (e) =>
          new InsertJobError({
            message: `insert job failed.\n${String(e)}`,
            errorType: "server",
          }),
      }).pipe(Effect.as(job)),
    checkDuplicate: (jobNumber: string) =>
      Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(jobs)
            .where(eq(jobs.jobNumber, jobNumber))
            .limit(1)
            .then((rows) => rows.length > 0),
        catch: (e) =>
          new InsertJobDuplicationError({
            message: `check duplicate failed. jobNumber=${jobNumber}\n${String(e)}`,
            errorType: "client",
          }),
      }),
  });
}

// 3. Layer を組み立てる関数
export function makeJobStoreClientLayer(
  db: DrizzleD1Database<Record<string, never>> & {
    $client: D1Database;
  },
) {
  return Layer.effect(JobStoreClient, buildJobStoreClientLive(db));
}
