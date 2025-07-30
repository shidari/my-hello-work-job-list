import {
  jobFetchClientErrorResponseSchema,
  jobFetchParamSchema,
  jobFetchServerErrorSchema,
  jobFetchSuccessResponseSchema,
} from "@sho/models";
import { OpenAPIRoute, contentJson } from "chanfana";
import { Effect, Exit } from "effect";
import { HTTPException } from "hono/http-exception";
import type { AppContext } from "../../app";
import { JobStoreClient, makeJobStoreClientLayer } from "../../client";
import { FetchJobError, JobNotFoundError } from "../../client/error";
import { getDb } from "../../db";
import { FetchJobValidationError } from "./error";

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
    const db = getDb(c);
    // Effect内でthisを使用したいため
    const self = this;
    const program = Effect.gen(function* () {
      const jobStoreClient = yield* JobStoreClient;
      const jobNumber = yield* Effect.tryPromise({
        try: () => self.getValidatedData<typeof self.schema>(),
        catch: (e) =>
          new FetchJobValidationError({
            message: `schema validation failed.\n${String(e)}`,
          }),
      }).pipe(Effect.map(({ params: { jobNumber } }) => jobNumber));
      const job = yield* jobStoreClient.fetchJob(jobNumber);
      return job;
    });
    const runnable = Effect.provide(program, makeJobStoreClientLayer(db));

    const exit = await Effect.runPromiseExit(runnable);

    return Exit.match(exit, {
      onFailure: (error) => {
        if (error instanceof FetchJobValidationError) {
          throw new HTTPException(400, { message: "invalid param" });
        }
        if (error instanceof JobNotFoundError) {
          throw new HTTPException(404, { message: "job not found" });
        }
        if (error instanceof FetchJobError) {
          throw new HTTPException(500, { message: "internal server error" });
        }
        throw new HTTPException(500, { message: "internal server error" });
      },
      onSuccess: (data) => {
        return c.json(data);
      },
    });
  }
}
