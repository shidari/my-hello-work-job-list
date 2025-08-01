import type { InsertJobRequestBody, Job } from "@sho/models";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { Context, Effect, Layer } from "effect";
import { jobs } from "../db/schema";
import {
  InsertJobDuplicationError,
  InsertJobError,
} from "../endpoint/jobInsert/error";
import { FetchJobError, FetchJobListError, JobNotFoundError } from "./error";

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
    readonly fetchJob: (
      jobNumber: string,
    ) => Effect.Effect<Job, FetchJobError | JobNotFoundError>;
    readonly fetchJobList: ({
      cursor,
      limit,
    }: {
      cursor?: { jobId: number };
      limit: number;
    }) => Effect.Effect<
      { jobs: Job[]; cursor: { jobId: number } },
      FetchJobListError
    >;
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
    fetchJob: (jobNumber: string) =>
      Effect.tryPromise({
        try: () =>
          db.select().from(jobs).where(eq(jobs.jobNumber, jobNumber)).limit(1),
        catch: (e) =>
          new FetchJobError({
            message: `fetch job failed. jobNumber=${jobNumber}\n${String(e)}`,
          }),
      }).pipe(
        Effect.flatMap((rows) => {
          if (rows.length === 0) {
            return Effect.fail(
              new JobNotFoundError({
                message: `Job not found for jobNumber=${jobNumber}`,
              }),
            );
          }
          return Effect.succeed(rows[0]);
        }),
      ),
    fetchJobList: ({
      limit = 20,
      cursor,
    }: { cursor?: { jobId: number }; limit: number }) =>
      Effect.tryPromise({
        try: () =>
          cursor
            ? db
                .select()
                .from(jobs)
                .where(gt(jobs.id, cursor.jobId))
                .limit(limit)
            : db.select().from(jobs).limit(limit),
        catch: (e) =>
          new FetchJobListError({
            message: `fetch job list failed.\n${String(e)}`,
          }),
      }).pipe(
        Effect.map((jobs) => {
          return {
            jobs: jobs,
            cursor: { jobId: jobs.length > 0 ? jobs[jobs.length - 1].id : 1 },
          };
        }),
      ),
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
