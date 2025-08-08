import type { InsertJobRequestBody, Job } from "@sho/models";
import { and, eq, gt, like } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { jobs } from "../db/schema";
import {
  createFetchJobError,
  createFetchJobListError,
  createInsertJobDuplicationError,
  createInsertJobError,
  createJobNotFoundError,
  type FetchJobError,
  type FetchJobListError,
  type InsertJobDuplicationError,
  type InsertJobError,
  type JobNotFoundError,
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
    filter?: { companyName?: string };
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
    filter = {},
  }: {
    cursor?: { jobId: number };
    limit: number;
    filter?: { companyName?: string };
  }) => {
    return ResultAsync.fromPromise(
      (() => {
        const db = client.getClient();

        // 基本的な条件を構築
        const conditions = [];

        // cursorの条件
        if (cursor) {
          conditions.push(gt(jobs.id, cursor.jobId));
        }

        // companyNameの正規表現フィルタ
        if (filter.companyName) {
          // オプション1: LIKE を使用（SQLiteのLIKEは基本的なパターンマッチング）
          conditions.push(like(jobs.companyName, `%${filter.companyName}%`));
        }

        const query = db.select().from(jobs);

        if (conditions.length > 0) {
          return query.where(and(...conditions)).limit(limit);
        }

        return query.limit(limit);
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
