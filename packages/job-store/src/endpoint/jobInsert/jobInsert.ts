import {
  insertJobClientErrorResponseSchema,
  insertJobRequestBodySchema,
  insertJobServerErrorResponseSchema,
  insertJobSuccessResponseSchema,
} from "@sho/models";
import { OpenAPIRoute, contentJson } from "chanfana";
import { Effect, Exit } from "effect";
import { HTTPException } from "hono/http-exception";
import type { AppContext } from "../../app";
import { JobStoreClient, makeJobStoreClientLayer } from "../../clientLayer";
import { getDb } from "../../db";
import {
  InsertJobDuplicationError,
  InsertJobError,
  InsertJobRequestValidationError,
} from "./error";

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
    // Effect内でthisを使用したいため
    const self = this;
    const program = Effect.gen(function* () {
      const jobStoreClient = yield* JobStoreClient;
      const validatedReqBody = yield* Effect.tryPromise({
        try: () => self.getValidatedData<typeof self.schema>(),
        catch: (e) =>
          new InsertJobRequestValidationError({
            message: `schema validation failed.\n${String(e)}`,
            errorType: "client",
          }),
      }).pipe(Effect.map(({ body }) => body));
      yield* jobStoreClient.insertJob(validatedReqBody);
      return validatedReqBody;
    });
    const runnable = Effect.provide(program, makeJobStoreClientLayer(db));

    const exit = await Effect.runPromiseExit(runnable);

    return Exit.match(exit, {
      onFailure: (error) => {
        if (error instanceof InsertJobRequestValidationError) {
          throw new HTTPException(400, { message: "invalid req body" });
        }
        if (error instanceof InsertJobDuplicationError) {
          throw new HTTPException(400, { message: "duplicated jobNumber" });
        }
        if (error instanceof InsertJobError) {
          throw new HTTPException(500, { message: "internal server error" });
        }
        throw new HTTPException(500, { message: "internal server error" });
      },
      onSuccess: (data) => {
        // dataの中にjobがあるなら
        return c.json({ success: true, result: data });
      },
    });
  }
}
