import type {
  CheckJobExistsCommand,
  CommandOutput,
  FindJobByNumberCommand,
  FindJobsCommand,
  InsertJobCommand,
  JobStoreCommand,
  JobStoreDBClient,
} from "@sho/models";
import { and, eq, gt, like, lt } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { jobs } from "../db/schema";

type DrizzleD1Client = DrizzleD1Database<Record<string, never>> & {
  $client: D1Database;
};

// --- コマンドごとの処理 ---
async function handleInsertJob(
  drizzle: DrizzleD1Client,
  cmd: InsertJobCommand,
): Promise<CommandOutput<InsertJobCommand>> {
  const now = new Date();
  const insertingValues = {
    ...cmd.payload,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: "active" as const,
  };
  const result = await drizzle.insert(jobs).values(insertingValues);
  const jobId =
    (result && "lastInsertRowid" in result
      ? Number(result.lastInsertRowid)
      : undefined) ?? 1;
  return { jobId };
}

async function handleFindJobByNumber(
  drizzle: DrizzleD1Client,
  cmd: FindJobByNumberCommand,
): Promise<CommandOutput<FindJobByNumberCommand>> {
  const rows = await drizzle
    .select()
    .from(jobs)
    .where(eq(jobs.jobNumber, cmd.jobNumber))
    .limit(1);
  return { job: rows.length > 0 ? rows[0] : null };
}

async function handleFindJobs(
  drizzle: DrizzleD1Client,
  cmd: FindJobsCommand,
): Promise<CommandOutput<FindJobsCommand>> {
  const { cursor, limit, filter = {} } = cmd.options;

  const cursorConditions = [];
  if (cursor) {
    cursorConditions.push(gt(jobs.id, cursor.jobId));
  }

  const filterConditions = [];
  if (filter.companyName) {
    filterConditions.push(like(jobs.companyName, `%${filter.companyName}%`));
  }
  if (filter.employeeCountGt !== undefined) {
    filterConditions.push(gt(jobs.employeeCount, filter.employeeCountGt));
  }
  if (filter.employeeCountLt !== undefined) {
    filterConditions.push(lt(jobs.employeeCount, filter.employeeCountLt));
  }

  const conditions = [...cursorConditions, ...filterConditions];
  const query = drizzle.select().from(jobs);

  const jobList =
    conditions.length > 0
      ? await query.where(and(...conditions)).limit(limit)
      : await query.limit(limit);

  // 仮のtotalCount取得
  const totalCount = await drizzle.$count(
    jobs,
    filterConditions.length > 0 ? and(...filterConditions) : undefined,
  );

  return {
    jobs: jobList,
    cursor: {
      jobId: jobList.length > 0 ? jobList[jobList.length - 1].id : 1,
    },
    meta: {
      totalCount,
      filter,
    },
  };
}

async function handleCheckJobExists(
  drizzle: DrizzleD1Client,
  cmd: CheckJobExistsCommand,
): Promise<CommandOutput<CheckJobExistsCommand>> {
  const rows = await drizzle
    .select()
    .from(jobs)
    .where(eq(jobs.jobNumber, cmd.jobNumber))
    .limit(1);
  return { exists: rows.length > 0 };
}

// --- アダプタ本体 ---
export const createJobStoreDBClientAdapter = (
  drizzleClient: DrizzleD1Client,
): JobStoreDBClient => ({
  execute: async <T extends JobStoreCommand>(
    cmd: T,
  ): Promise<CommandOutput<T>> => {
    switch (cmd.type) {
      case "InsertJob":
        return (await handleInsertJob(
          drizzleClient,
          cmd as InsertJobCommand,
        )) as CommandOutput<T>;
      case "FindJobByNumber":
        return (await handleFindJobByNumber(
          drizzleClient,
          cmd as FindJobByNumberCommand,
        )) as CommandOutput<T>;
      case "FindJobs":
        return (await handleFindJobs(
          drizzleClient,
          cmd as FindJobsCommand,
        )) as CommandOutput<T>;
      case "CheckJobExists":
        return (await handleCheckJobExists(
          drizzleClient,
          cmd as CheckJobExistsCommand,
        )) as CommandOutput<T>;
      default: {
        const _exhaustive: never = cmd;
        throw new Error("Unknown command type");
      }
    }
  },
});
