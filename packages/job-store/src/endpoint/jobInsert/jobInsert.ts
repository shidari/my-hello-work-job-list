import {
  insertJobClientErrorResponseSchema,
  insertJobRequestBodySchema,
  insertJobServerErrorResponseSchema,
  insertJobSuccessResponseSchema,
} from "@sho/models";
import { OpenAPIRoute, contentJson } from "chanfana";
import { HTTPException } from "hono/http-exception";
import { ResultAsync, okAsync, safeTry } from "neverthrow";
import type { AppContext } from "../../app";
import { JobStoreClientImplBuilder, createD1DBClient } from "../../client";
import { getDb } from "../../db";
import { createFetchValidationError } from "../jobFetch/error";

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
    const self = this;
    // バリデーション
    const result = safeTry(async function* () {
      const validatedData = yield* await ResultAsync.fromPromise(
        self.getValidatedData<typeof self.schema>(),
        (error) =>
          createFetchValidationError(`Validation failed: ${String(error)}`),
      );
      const { body } = validatedData;
      const db = getDb(c);
      const dbClient = createD1DBClient(db);
      const jobStore = JobStoreClientImplBuilder(dbClient);
      const job = yield* await jobStore.insertJob(body);
      return okAsync(job);
    });
    return result.match(
      (job) => c.json(job),
      (error) => {
        switch (error._tag) {
          case "InsertJobError":
            throw new HTTPException(500, { message: error.message });
          case "InsertJobDuplicationError":
          case "FetchJobValidationError":
            throw new HTTPException(400, { message: error.message });
          default:
            throw new HTTPException(500, { message: "Unknown error occurred" });
        }
      },
    );
  }
}
