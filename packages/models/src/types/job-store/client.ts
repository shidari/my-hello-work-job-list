import type { Job } from "./jobFetch";
import type { InsertJobRequestBody } from "./jobInsert";

export type SearchFilter = { companyName?: string };

export type JobStoreDBClient = {
  insertJob: (job: InsertJobRequestBody) => Promise<InsertJobRequestBody>;
  findJobByNumber: (jobNumber: string) => Promise<Job | null>;
  findJobs: (options: {
    cursor?: { jobId: number };
    limit: number;
    filter: { companyName?: string };
  }) => Promise<{
    jobs: Job[];
    cursor: { jobId: number };
    meta: { totalCount: number; filter: SearchFilter };
  }>;
  checkJobExists: (jobNumber: string) => Promise<boolean>;
};
