import type { InsertJobRequestBody, Job, JobStoreDBClient } from "@sho/models";
import { and, eq, gt, like } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { jobs } from "../db/schema";

type DrizzleD1Client = DrizzleD1Database<Record<string, never>> & {
  $client: D1Database;
};

export const createJobStoreDBClientAdapter = (
  drizzleClient: DrizzleD1Client,
): JobStoreDBClient => ({
  insertJob: async (
    job: InsertJobRequestBody,
  ): Promise<InsertJobRequestBody> => {
    const now = new Date();
    const insertingValues = {
      ...job,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: "active" as const,
    };
    await drizzleClient.insert(jobs).values(insertingValues);
    return job;
  },

  findJobByNumber: async (jobNumber: string): Promise<Job | null> => {
    const rows = await drizzleClient
      .select()
      .from(jobs)
      .where(eq(jobs.jobNumber, jobNumber))
      .limit(1);
    return rows.length > 0 ? rows[0] : null;
  },

  findJobs: async (options: {
    cursor?: { jobId: number };
    limit: number;
    filter?: { companyName?: string };
  }): Promise<{ jobs: Job[]; cursor: { jobId: number } }> => {
    const { cursor, limit, filter = {} } = options;

    const conditions = [];

    if (cursor) {
      conditions.push(gt(jobs.id, cursor.jobId));
    }

    if (filter.companyName) {
      conditions.push(like(jobs.companyName, `%${filter.companyName}%`));
    }

    const query = drizzleClient.select().from(jobs);

    const jobList =
      conditions.length > 0
        ? await query.where(and(...conditions)).limit(limit)
        : await query.limit(limit);

    return {
      jobs: jobList,
      cursor: {
        jobId: jobList.length > 0 ? jobList[jobList.length - 1].id : 1,
      },
    };
  },

  checkJobExists: async (jobNumber: string): Promise<boolean> => {
    const rows = await drizzleClient
      .select()
      .from(jobs)
      .where(eq(jobs.jobNumber, jobNumber))
      .limit(1);
    return rows.length > 0;
  },
});
