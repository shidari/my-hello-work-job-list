import {
  JobInsertBodySchema,
  JobInsertSuccessResponseSchema,
} from "@sho/schema";
import { OpenAPIRoute } from "chanfana";
import { HTTPException } from "hono/http-exception";
import { ResultAsync } from "neverthrow";
import type { z } from "zod";
import { customLogger } from "..";
import { getDb } from "../db";
import { jobs } from "../db/schema";
import type { AppContext } from "../types";

export class JobInsert extends OpenAPIRoute {
  schema = {
    summary: "Insert a Job",
    request: {
      body: {
        content: {
          "application/json": {
            schema: JobInsertBodySchema,
            examples: {
              default: {
                summary: "Example job",
                value: {
                  jobNumber: "49589-79146903",
                  companyName: "株式会社サンプル",
                  receivedDate: "2025-07-01T00:00:00.000Z",
                  expiryDate: "2025-07-31T00:00:00.000Z",
                  homePage: "https://example.com/",
                  occupation: "システムエンジニア",
                  employmentType: "正社員",
                  employeeCount: 42,
                  wageMin: 250000,
                  wageMax: 350000,
                  workingStartTime: "09:00:00",
                  workingEndTime: "18:00:00",
                },
              },
            },
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Returns the inserted Job",
        content: {
          "application/json": {
            schema: JobInsertSuccessResponseSchema,
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const result = await this.validateData().andThen(({ body }) => {
      customLogger(
        "job will be inserted:",
        `Job: ${JSON.stringify(body, null, 2)}`,
      );
      return this.insertJob(body, c);
    });
    return result.match(
      (job) => c.json({ success: true, result: { job } }),
      (err) => {
        console.error(err.message);
        switch (err.type) {
          case "Validation":
            throw new HTTPException(400, { message: "request body invalid" });
          default:
            throw new HTTPException(500, {
              message: "internal server error.",
            });
        }
      },
    );
  }

  private validateData() {
    return ResultAsync.fromPromise(
      this.getValidatedData<typeof this.schema>(),
      (e) => {
        return {
          type: "Validation",
          message: `validation failed.\n${String(e)}`,
        };
      },
    );
  }

  private insertJob(data: z.infer<typeof JobInsertBodySchema>, c: AppContext) {
    const {
      jobNumber,
      companyName,
      employeeCount,
      employmentType,
      expiryDate,
      receivedDate,
      wageMax,
      wageMin,
      workingEndTime,
      workingStartTime,
      occupation,
      homePage,
    } = data;

    const now = new Date();
    const inserTingValues = {
      jobNumber,
      companyName,
      employeeCount,
      employmentType,
      expiryDate,
      receivedDate,
      homePage,
      wageMax,
      wageMin,
      workingStartTime,
      workingEndTime,
      occupation,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    console.log(
      `inserting values.\nvalues=${JSON.stringify(inserTingValues, null, 2)}`,
    );
    const db = getDb(c);
    return ResultAsync.fromPromise(
      db.insert(jobs).values(inserTingValues).returning(),
      (e) => {
        return {
          type: "InsertJob",
          message: `insert job failed.\n${String(e)}`,
        };
      },
    ).map((returningData) => {
      console.log(JSON.stringify(returningData, null, 2));
      return data;
    });
  }
}
