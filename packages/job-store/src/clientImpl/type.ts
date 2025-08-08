import type { InsertJobRequestBody, Job, JobStoreDBClient } from "@sho/models";
import type { ResultAsync } from "neverthrow";
import type {
  FetchJobError,
  FetchJobListError,
  InsertJobDuplicationError,
  InsertJobError,
  JobNotFoundError,
} from "./error";

export type JobStoreResultBuilder = (client: JobStoreDBClient) => {
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
