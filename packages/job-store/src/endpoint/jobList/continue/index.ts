import {
  type DecodedNextToken,
  decodedNextTokenSchema,
  jobListContinueClientErrorResponseSchema,
  jobListContinueQuerySchema,
  jobListContinueServerErrorSchema,
  jobListSuccessResponseSchema,
} from "@sho/models";
import { contentJson, OpenAPIRoute } from "chanfana";
import { HTTPException } from "hono/http-exception";
import { decode, sign } from "hono/jwt";
import { errAsync, okAsync, ResultAsync, safeTry } from "neverthrow";
import type { AppContext } from "../../../app";
import { createJobStoreResultBuilder } from "../../../clientImpl";
import { createJobStoreDBClientAdapter } from "../../../clientImpl/adapter";
import { getDb } from "../../../db";
import {
  createJWTSignatureError,
  createSchemaValidationError,
} from "../../error";
import {
  createDecodeJWTPayloadError,
  createJWTDecodeError,
  createJWTExpiredError,
} from "./error";

export class JobListContinueEndpoint extends OpenAPIRoute {
  schema = {
    request: {
      query: jobListContinueQuerySchema,
    },
    responses: {
      "200": {
        description: "Successful response",
        ...contentJson(jobListSuccessResponseSchema),
      },
      "400": {
        description: "client error response",
        ...contentJson(jobListContinueClientErrorResponseSchema),
      },
      "500": {
        description: "internal server error response",
        ...contentJson(jobListContinueServerErrorSchema),
      },
    },
  };

  async handle(c: AppContext) {
    const self = this;
    const result = safeTry(async function* () {
      // バリデーション
      const validatedData = yield* await ResultAsync.fromPromise(
        self.getValidatedData<typeof self.schema>(),
        (error) =>
          createSchemaValidationError(
            `Fetch JobListContinue validation failed\n${String(error)}`,
          ),
      );

      const {
        query: { nextToken },
      } = validatedData;

      const jwtSecret = c.env.JWT_SECRET;

      const db = getDb(c);
      const dbClient = createJobStoreDBClientAdapter(db); // DrizzleをJobStoreDBClientに変換
      const jobStore = createJobStoreResultBuilder(dbClient);

      const decodeResult = yield* ResultAsync.fromPromise(
        Promise.resolve(decode(nextToken)),
        (error) =>
          createJWTDecodeError(`JWT decoding failed.\n${String(error)}`),
      );
      const payloadValidation = decodedNextTokenSchema.safeParse(
        decodeResult.payload,
      );
      if (!payloadValidation.success) {
        return errAsync(
          createDecodeJWTPayloadError(
            `Decoding JWT payload failed.\n${String(payloadValidation.error)}`,
          ),
        );
      }
      const validatedPayload = payloadValidation.data;

      // JWT有効期限チェック
      const now = Math.floor(Date.now() / 1000);
      if (validatedPayload.exp && validatedPayload.exp < now) {
        return errAsync(createJWTExpiredError("JWT expired"));
      }

      const limit = 20;
      // ジョブリスト取得
      const jobListResult = yield* await jobStore.fetchJobList({
        cursor: { jobId: validatedPayload.cursor.jobId },
        limit,
        filter: validatedPayload.filter,
      });

      const {
        jobs,
        cursor: { jobId },
        meta,
      } = jobListResult;

      const { count: restJobCount } = yield* await jobStore.countJobs({
        cursor: { jobId },
        filter: meta.filter,
      });

      const newNextToken = yield* (() => {
        if (restJobCount <= limit) return okAsync(undefined);
        const validPayload: DecodedNextToken = {
          exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15分後の有効期限
          cursor: { jobId },
          filter: meta.filter,
        };
        const signResult = ResultAsync.fromPromise(
          sign(validPayload, jwtSecret),
          (error) =>
            createJWTSignatureError(`JWT signing failed.\n${String(error)}`),
        );
        return signResult;
      })();

      return okAsync({ jobs, nextToken: newNextToken, meta });
    });

    return result.match(
      ({ jobs, nextToken, meta }) => c.json({ jobs, nextToken, meta }),
      (error) => {
        console.error(error);

        switch (error._tag) {
          case "JWTDecodeError":
            throw new HTTPException(400, { message: "invalid nextToken" });
          case "JWTSignatureError":
            throw new HTTPException(500, { message: error.message });
          case "JWTExpiredError":
            throw new HTTPException(401, { message: "nextToken expired" });
          case "DecodeJWTPayloadError":
            throw new HTTPException(400, { message: "invalid nextToken" });
          case "ResponseSchemaValidationError":
            throw new HTTPException(400, { message: "invalid query" });
          default:
            throw new HTTPException(500, { message: "internal server error" });
        }
      },
    );
  }
}
