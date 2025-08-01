import {
  decodedNextTokenSchema,
  jobListClientErrorResponseSchema,
  jobListQuerySchema,
  jobListServerErrorSchema,
  jobListSuccessResponseSchema,
} from "@sho/models";
import { OpenAPIRoute, contentJson } from "chanfana";
import { Effect, Exit } from "effect";
import { HTTPException } from "hono/http-exception";
import { decode, sign } from "hono/jwt";
import type { AppContext } from "../../app";
import { JobStoreClient, makeJobStoreClientLayer } from "../../client";
import { FetchJobListError } from "../../client/error";
import { getDb } from "../../db";
import {
  DecodeJWTPayloadError,
  GetJWTSecretError,
  JWTDecodeError,
  JWTExpiredError,
  JWTSignatureError,
} from "./error";

const j = Symbol();
type JWTSecret = string & { j: unknown };

export class JobListEndpoint extends OpenAPIRoute {
  schema = {
    request: {
      query: jobListQuerySchema,
    },
    responses: {
      "200": {
        description: "Successful response",
        ...contentJson(jobListSuccessResponseSchema),
      },
      "400": {
        description: "client error response",
        ...contentJson(jobListClientErrorResponseSchema),
      },
      "500": {
        description: "internal server error response",
        ...contentJson(jobListServerErrorSchema),
      },
    },
  };

  async handle(c: AppContext) {
    const db = getDb(c);
    // Effect内でthisを使用したいため
    const self = this;
    const program = Effect.gen(function* () {
      const jobStoreClient = yield* JobStoreClient;
      // jwtを使ってnextToken作る
      const jwtSecret = yield* (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret)
          return Effect.fail(
            new GetJWTSecretError({ message: "getting jwt secret failed" }),
          );
        return Effect.succeed(secret as JWTSecret);
      })();

      const nextTokenOrNot = yield* Effect.tryPromise({
        try: () => self.getValidatedData<typeof self.schema>(),
        catch: (e) =>
          new FetchJobListError({ message: "Fetch JobList validation failed" }),
      }).pipe(Effect.map(({ query }) => query.nextToken));

      // ここ、どうしてもいい処理が思いつかないので一旦汚く
      if (!nextTokenOrNot) {
        const {
          jobs,
          cursor: { jobId },
        } = yield* jobStoreClient.fetchJobList({
          cursor: { jobId: INITIAL_JOB_ID },
          limit: 20,
        });
        const signed = yield* Effect.tryPromise({
          try: () =>
            sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 15,
                cursor: { jobId },
              },
              jwtSecret,
            ),
          catch: (e) =>
            new JWTSignatureError({
              message: `JWT signing failed.\n${String(e)}`,
            }),
        });
        return { jobs, nextToken: signed };
      }
      const nextToken = nextTokenOrNot;
      const { payload } = yield* Effect.try({
        try: () => decode(nextToken),
        catch: (e) =>
          new JWTDecodeError({ message: `JWT decoding failed.\n${String(e)}` }),
      });
      const validatedPayload = (() => {
        const result = decodedNextTokenSchema.safeParse(payload);
        if (!result.success)
          throw new DecodeJWTPayloadError({
            message: `Decoding JWT payload failed.\n${String(result.error)}`,
          });
        return result.data;
      })();
      const now = Math.floor(Date.now() / 1000);
      if (validatedPayload.exp && validatedPayload.exp < now)
        return Effect.fail(new JWTExpiredError({ message: "JWT expired" }));
      const jobListData = yield* jobStoreClient.fetchJobList({
        cursor: { jobId: validatedPayload.cursor.jobId },
        limit: 20,
      });
      const signed = yield* Effect.tryPromise({
        try: () =>
          sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 15,
              cursor: { jobId: jobListData.cursor.jobId },
            },
            jwtSecret,
          ),
        catch: (e) =>
          new JWTSignatureError({
            message: `JWT signing failed.\n${String(e)}`,
          }),
      });
      return { jobs: jobListData.jobs, nextToken: signed };
    });
    const runnable = Effect.provide(program, makeJobStoreClientLayer(db));

    const exit = await Effect.runPromiseExit(runnable);

    return Exit.match(exit, {
      onFailure: (error) => {
        // そのうちここ綺麗にしたい
        if (error instanceof FetchJobListError) {
          throw new HTTPException(500, { message: "internal server error" });
        }
        if (error instanceof GetJWTSecretError) {
          throw new HTTPException(500, { message: "internal server error" });
        }
        if (error instanceof JWTSignatureError) {
          throw new HTTPException(500, { message: "internal server error" });
        }
        if (error instanceof JWTDecodeError) {
          throw new HTTPException(500, { message: "internal server error" });
        }
        if (error instanceof DecodeJWTPayloadError) {
          throw new HTTPException(500, { message: "internal server error" });
        }
        if (error instanceof JWTExpiredError) {
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
