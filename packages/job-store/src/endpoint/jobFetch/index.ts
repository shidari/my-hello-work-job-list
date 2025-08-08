import {
  jobFetchClientErrorResponseSchema,
  jobFetchParamSchema,
  jobFetchServerErrorSchema,
  jobFetchSuccessResponseSchema,
} from "@sho/models";
import { OpenAPIRoute, contentJson } from "chanfana";
import { HTTPException } from "hono/http-exception";
import { ResultAsync, okAsync, safeTry } from "neverthrow";
import type { AppContext } from "../../app";
import { JobStoreClientImplBuilder, createD1DBClient } from "../../client";
import { getDb } from "../../db";
import { createFetchValidationError } from "./error";

export class JobFetchEndpoint extends OpenAPIRoute {
  schema = {
    request: {
      params: jobFetchParamSchema,
    },
    responses: {
      "200": {
        description: "Successful response",
        ...contentJson(jobFetchSuccessResponseSchema),
      },
      "400": {
        description: "client error response",
        ...contentJson(jobFetchClientErrorResponseSchema),
      },
      "500": {
        description: "internal server error response",
        ...contentJson(jobFetchServerErrorSchema),
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
      const {
        params: { jobNumber },
      } = validatedData;
      const db = getDb(c);
      const dbClient = createD1DBClient(db);
      const jobStore = JobStoreClientImplBuilder(dbClient);
      const job = yield* await jobStore.fetchJob(jobNumber);
      return okAsync(job);
    });
    return result.match(
      (job) => c.json(job),
      (error) => {
        switch (error._tag) {
          case "FetchJobError":
            throw new HTTPException(500, { message: error.message });
          case "JobNotFoundError":
            throw new HTTPException(404, { message: error.message });
          case "FetchJobValidationError":
            throw new HTTPException(400, { message: error.message });
          default:
            throw new HTTPException(500, { message: "internal server error" });
        }
      },
    );
  }
}
