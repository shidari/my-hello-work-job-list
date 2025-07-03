import { JobSchemaForUI } from "@sho/schema";
import { OpenAPIRoute } from "chanfana";
import { HTTPException } from "hono/http-exception";
import { ResultAsync } from "neverthrow";
import { z } from "zod";
import { getDb } from "../db";
import { jobs } from "../db/schema";
import type {
  AppContext,
  JobFetchError,
  JobForUI,
  JobFromDrizzle,
  ValidationError,
} from "../types";

export class JobList extends OpenAPIRoute {
  schema = {
    summary: "Fetch paginated Job List",
    request: {
      query: z.object({
        page: z
          .string()
          .regex(/^\d+$/)
          .transform((strPage) => Number(strPage))
          .optional(),
        limit: z
          .string()
          .regex(/^\d+$/)
          .transform((strLimit) => Number(strLimit))
          .optional(),
      }),
    },
    responses: {
      "200": {
        description: "Returns pagenated Job List",
        content: {
          "application/json": {
            schema: z.array(JobSchemaForUI),
          },
        },
      },
      "404": {
        description: "JobList not found",
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
  async handle(c: AppContext) {
    const db = getDb(c);
    const result = this.validateQuery().andThen(({ page, limit }) =>
      this.fetchJobs({ db, page, limit }),
    );
    return result.match(
      (jobs) => c.json(this.tranformForUI(jobs)),
      (err) => {
        console.error(err);
        switch (err.type) {
          case "Validation":
            return new HTTPException(400, { message: "invalid query" });
          default:
            return new HTTPException(500, {
              message: "internal server error.",
            });
        }
      },
    );
  }
  private validateQuery(): ResultAsync<
    {
      page: number;
      limit: number;
    },
    ValidationError
  > {
    return ResultAsync.fromSafePromise(
      this.getValidatedData<typeof this.schema>(),
    )
      .map(({ query }) => ({
        page: query.page || 0,
        limit: query.limit || 100,
      }))
      .mapErr((e) => ({
        type: "Validation",
        message: `validation failed.\n${String(e)}`,
      }));
  }
  private fetchJobs({
    db,
    page,
    limit,
  }: {
    db: ReturnType<typeof getDb>;
    page: number;
    limit: number;
  }) {
    const offset = page * limit;
    return ResultAsync.fromSafePromise<JobFromDrizzle[], JobFetchError>(
      db.select().from(jobs).limit(limit).offset(offset).all(),
    ).mapErr((e) => ({
      type: "JobFetch",
      message: `job fetch failed.\n${String(e)}`,
    }));
  }
  private tranformForUI(jobs: JobFromDrizzle[]): JobForUI[] {
    return jobs.map((job) => ({
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
    }));
  }
}
