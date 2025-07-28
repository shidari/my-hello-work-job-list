import {
  type InsertJobRequestBody,
  insertJobClientErrorResponseSchema,
  insertJobRequestBodySchema,
  insertJobServerErrorResponseSchema,
  insertJobSuccessResponseSchema,
} from "@sho/models";
import { OpenAPIRoute, contentJson } from "chanfana";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { ResultAsync, err, ok } from "neverthrow";
import type { AppContext } from "../app";
import { getDb } from "../db";
import { jobs } from "../db/schema";

export class JobInsertEndpoint extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        ...contentJson(insertJobRequestBodySchema),
      },
    },
    responses: {
      "200": {
        description: "Successful response",
        ...contentJson(insertJobSuccessResponseSchema),
      },
      "400": {
        description: "client error response",
        ...contentJson(insertJobClientErrorResponseSchema),
      },
      "500": {
        description: "internal server error response",
        ...contentJson(insertJobServerErrorResponseSchema),
      },
    },
  };

  async handle(c: AppContext) {
    const db = getDb(c);
    const client = new D1Client(db);
    const result = ResultAsync.fromPromise(
      this.getValidatedData<typeof this.schema>(),
      (e) =>
        ({
          type: "ValidateError",
          message: `schema validateion failed.\n${String(e)}`,
        }) as const,
    ).andThen(({ body }) => client.insertJob(body));
    return result.match(
      (job) => c.json({ success: true, result: { job } }, 200),
      (e) => {
        console.error(e);
        switch (e.type) {
          case "ValidateError":
            throw new HTTPException(400, { message: "invalid req body" });
          case "DuplicateJobError":
            throw new HTTPException(400, {
              message: `duplicate jobNumber: ${jobs.jobNumber}`,
            });
          case "InsertJobError":
            throw new HTTPException(500, { message: "internal server error" });
          default:
            throw new HTTPException(500, { message: "internal server error" });
        }
      },
    );
  }
}

class D1Client {
  private db: DrizzleD1Database<Record<string, never>> & {
    $client: D1Database;
  };

  constructor(
    db: DrizzleD1Database<Record<string, never>> & {
      $client: D1Database;
    },
  ) {
    this.db = db;
  }

  insertJob(job: InsertJobRequestBody) {
    return this.checkDuplicate(job.jobNumber)
      .andThen((duplicated) => {
        if (duplicated) {
          return err({
            type: "DuplicateJobError" as const,
            message: `job duplicated. jobNumber=${job.jobNumber}}`,
          });
        }
        return ok(job);
      })
      .andThen((job) => {
        const now = new Date();
        const insertingValues = {
          ...job,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          status: "active",
        };

        console.log(
          `inserting values.\nvalues=${JSON.stringify(insertingValues, null, 2)}`,
        );
        this.db.insert(jobs).values(insertingValues);
        return ResultAsync.fromPromise(
          this.db.insert(jobs).values(insertingValues),
          (e) => {
            return {
              type: "InsertJobError",
              message: `insert job failed.\n${String(e)}`,
            } as const;
          },
        );
      });
  }

  checkDuplicate(jobNumber: string) {
    return ResultAsync.fromPromise(
      this.db.select().from(jobs).where(eq(jobs.jobNumber, jobNumber)).limit(1),
      (e) => ({
        type: "SelectJobError" as const,
        message: `select job failed. jobNumber=${jobNumber}\n${String(e)}`,
      }),
    ).map((rows) => rows.length !== 0);
  }
}
