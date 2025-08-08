import type { InsertJobRequestBody, Job } from "@sho/models";
import { eq, gt } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { jobs } from "../db/schema";
import {
  type FetchJobError,
  type FetchJobListError,
  type InsertJobDuplicationError,
  type InsertJobError,
  type JobNotFoundError,
  createFetchJobError,
  createFetchJobListError,
  createInsertJobDuplicationError,
  createInsertJobError,
  createJobNotFoundError,
} from "./error";

type DBClient<T> = {
  getClient: () => T;
};

type D1DBClient = DBClient<
  DrizzleD1Database<Record<string, never>> & {
    $client: D1Database;
  }
>;

// JobStoreClientImplBuilderの型定義
type JobStoreClientImplBuilder = (client: D1DBClient) => {
  insertJob: (
    job: InsertJobRequestBody,
  ) => ResultAsync<
    InsertJobRequestBody,
    InsertJobDuplicationError | InsertJobError
  >;
  fetchJob: (
    jobNumber: string,
  ) => ResultAsync<Job, FetchJobError | JobNotFoundError>;
  checkDuplicate: (
    jobNumber: string,
  ) => ResultAsync<boolean, InsertJobDuplicationError>;
  fetchJobList: (params: {
    cursor?: { jobId: number };
    limit: number;
  }) => ResultAsync<
    { jobs: Job[]; cursor: { jobId: number } },
    FetchJobListError
  >;
};

// JobStoreClientImplBuilderの実装
export const JobStoreClientImplBuilder: JobStoreClientImplBuilder = (
  client,
) => ({
  insertJob: (job: InsertJobRequestBody) => {
    return ResultAsync.fromPromise(
      (async () => {
        const db = client.getClient();
        const now = new Date();
        const insertingValues = {
          ...job,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          status: "active" as const,
        };
        await db.insert(jobs).values(insertingValues);
        return job;
      })(),
      (error) =>
        createInsertJobError(`insert job failed.\n${String(error)}`, "server"),
    );
  },

  fetchJob: (jobNumber: string) => {
    return ResultAsync.fromPromise(
      client
        .getClient()
        .select()
        .from(jobs)
        .where(eq(jobs.jobNumber, jobNumber))
        .limit(1),
      (error) =>
        createFetchJobError(
          `fetch job failed. jobNumber=${jobNumber}\n${String(error)}`,
        ),
    ).andThen((rows) => {
      if (rows.length === 0) {
        return errAsync(
          createJobNotFoundError(`Job not found for jobNumber=${jobNumber}`),
        );
      }
      return okAsync(rows[0]);
    });
  },

  checkDuplicate: (jobNumber: string) => {
    return ResultAsync.fromPromise(
      client
        .getClient()
        .select()
        .from(jobs)
        .where(eq(jobs.jobNumber, jobNumber))
        .limit(1)
        .then((rows) => rows.length > 0),
      (error) =>
        createInsertJobDuplicationError(
          `check duplicate failed. jobNumber=${jobNumber}\n${String(error)}`,
          "client",
        ),
    );
  },

  fetchJobList: ({
    limit = 20,
    cursor,
  }: { cursor?: { jobId: number }; limit: number }) => {
    return ResultAsync.fromPromise(
      (() => {
        const db = client.getClient();
        return cursor
          ? db.select().from(jobs).where(gt(jobs.id, cursor.jobId)).limit(limit)
          : db.select().from(jobs).limit(limit);
      })(),
      (error) =>
        createFetchJobListError(`fetch job list failed.\n${String(error)}`),
    ).map((jobList) => ({
      jobs: jobList,
      cursor: {
        jobId: jobList.length > 0 ? jobList[jobList.length - 1].id : 1,
      },
    }));
  },
});

// D1DBClientファクトリ
export const createD1DBClient = (
  db: DrizzleD1Database<Record<string, never>> & {
    $client: D1Database;
  },
): D1DBClient => ({
  getClient: () => db,
});
