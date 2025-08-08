import type { InsertJobRequestBody, JobStoreDBClient } from "@sho/models";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import {
  createFetchJobError,
  createFetchJobListError,
  createInsertJobDuplicationError,
  createInsertJobError,
  createJobNotFoundError,
} from "./error";
import type { JobStoreResultBuilder } from "./type";

// JobStoreResultBuilderの実装
export const createJobStoreResultBuilder: JobStoreResultBuilder = (
  dbClient: JobStoreDBClient, // JobStoreDBClientインターフェースを受け取る
) => ({
  insertJob: (job: InsertJobRequestBody) => {
    return ResultAsync.fromPromise(
      dbClient.insertJob(job), // dbClientのメソッドを使用
      (error) =>
        createInsertJobError(`insert job failed.\n${String(error)}`, "server"),
    );
  },
  fetchJob: (jobNumber: string) => {
    return ResultAsync.fromPromise(
      dbClient.findJobByNumber(jobNumber), // dbClientのメソッドを使用
      (error) =>
        createFetchJobError(
          `fetch job failed. jobNumber=${jobNumber}\n${String(error)}`,
        ),
    ).andThen((job) => {
      if (!job) {
        return errAsync(
          createJobNotFoundError(`Job not found for jobNumber=${jobNumber}`),
        );
      }
      return okAsync(job);
    });
  },

  checkDuplicate: (jobNumber: string) => {
    return ResultAsync.fromPromise(
      dbClient.checkJobExists(jobNumber), // dbClientのメソッドを使用
      (error) =>
        createInsertJobDuplicationError(
          `check duplicate failed. jobNumber=${jobNumber}\n${String(error)}`,
          "client",
        ),
    );
  },

  fetchJobList: (params: {
    cursor?: { jobId: number };
    limit: number;
    filter?: { companyName?: string };
  }) => {
    return ResultAsync.fromPromise(
      dbClient.findJobs(params), // dbClientのメソッドを使用
      (error) =>
        createFetchJobListError(`fetch job list failed.\n${String(error)}`),
    );
  },
});
