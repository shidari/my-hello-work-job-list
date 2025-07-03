import { JobSchemaForUI } from "@sho/schema";
import { OpenAPIRoute } from "chanfana";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { z } from "zod";
import { getDb } from "../db";
import { jobs } from "../db/schema";
import type {
  AppContext,
  JobFetchError,
  JobForUI,
  JobFromDrizzle,
} from "../types";

export class JobFetch extends OpenAPIRoute {
  schema = {
    summary: "Fetch a Job",
    request: {
      params: z.object({
        jobNumber: z.string(),
      }),
    },
    responses: {
      "200": {
        description: "Returns the Job data",
        content: {
          "application/json": {
            schema: z.object({
              job: JobSchemaForUI,
            }),
          },
        },
      },
      "404": {
        description: "Job not found",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  };
  private tranformForUI(job: JobFromDrizzle): JobForUI {
    return {
      jobNumber: job.jobNumber,
      companyName: job.companyName,
      occupation: job.occupation,
      employeeCount: job.employeeCount,
      employmentType: job.employmentType,
      expiryDate: job.expiryDate,
      receivedDate: job.receivedDate,
      wage: `${job.wageMin}円〜${job.wageMax}`,
      workingHours: `${job.workingStartTime}〜${job.workingEndTime}`,
      homePage: job.homePage,
      updatedAt: job.updatedAt,
    };
  }

  private fetchJob(
    jobNumber: string,
    db: DrizzleD1Database<Record<string, never>> & {
      $client: D1Database;
    },
  ) {
    return ResultAsync.fromPromise<JobFromDrizzle, JobFetchError>(
      db.select().from(jobs).where(eq(jobs.jobNumber, jobNumber)).get(),
      (e) => ({
        type: "JobFetchFailed",
        message: `job fetch failed. \n${String(e)}`,
      }),
    ).andThen((job) => {
      if (!job) {
        return errAsync({
          type: "JobFetchNotFound",
          message: `job not found. jobNumber=${jobNumber}`,
        });
      }
      return okAsync(job);
    });
  }

  async handle(c: AppContext) {
    const { jobNumber } = c.req.param();
    const db = getDb(c);
    const result = this.fetchJob(jobNumber, db);
    return result.match(
      (job) => c.json(this.tranformForUI(job)),
      (e) => {
        console.error(e);
        switch (e.type) {
          case "JobFetchFailed":
            throw new HTTPException(500, { message: "internal server error" });
          case "JobFetchNotFound":
            throw new HTTPException(404, {
              message: `job not found. jobNumber=${jobNumber}`,
            });
          default:
            throw new HTTPException(500, {
              message: "internal server error.",
            });
        }
      },
    );
  }
}
