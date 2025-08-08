import {
  insertJobClientErrorResponseSchema,
  insertJobRequestBodySchema,
  insertJobServerErrorResponseSchema,
  insertJobSuccessResponseSchema,
} from "@sho/models";
import { contentJson, OpenAPIRoute } from "chanfana";
import { HTTPException } from "hono/http-exception";
import { okAsync, ResultAsync, safeTry } from "neverthrow";
import type { AppContext } from "../../app";
import { createJobStoreResultBuilder } from "../../clientImpl";
import { createJobStoreDBClientAdapter } from "../../clientImpl/adapter";
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
      const dbClient = createJobStoreDBClientAdapter(db);
      const jobStore = createJobStoreResultBuilder(dbClient);
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
