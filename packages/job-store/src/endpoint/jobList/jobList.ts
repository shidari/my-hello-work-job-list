import {
  decodedNextTokenSchema,
  jobListClientErrorResponseSchema,
  jobListQuerySchema,
  jobListServerErrorSchema,
  jobListSuccessResponseSchema,
} from "@sho/models";
import { contentJson, OpenAPIRoute } from "chanfana";
import { HTTPException } from "hono/http-exception";
import { decode, sign } from "hono/jwt";
import { errAsync, okAsync, ResultAsync, safeTry } from "neverthrow";
import type { AppContext } from "../../app";
import { createJobStoreResultBuilder } from "../../clientImpl";
import { createJobStoreDBClientAdapter } from "../../clientImpl/adapter";
import { getDb } from "../../db";
import {
  createDecodeJWTPayloadError,
  createFetchJobListValidationError,
  createJWTDecodeError,
  createJWTExpiredError,
  createJWTSignatureError,
} from "./error";

const INITIAL_JOB_ID = 1; // 初期のcursorとして使用するjobId

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
    const self = this;
    const result = safeTry(async function* () {
      // バリデーション
      const validatedData = yield* await ResultAsync.fromPromise(
        self.getValidatedData<typeof self.schema>(),
        (error) =>
          createFetchJobListValidationError(
            `Fetch JobList validation failed\n${String(error)}`,
          ),
      );

      const {
        query: { nextToken, companyName: encodedCompanyName },
      } = validatedData;

      const companyName = encodedCompanyName
        ? decodeURIComponent(encodedCompanyName)
        : undefined;
      const jwtSecret = c.env.JWT_SECRET;

      // JobStoreClientの作成
      const db = getDb(c);
      const dbClient = createJobStoreDBClientAdapter(db); // DrizzleをJobStoreDBClientに変換
      const jobStore = createJobStoreResultBuilder(dbClient);

      // nextTokenがない場合（初回リクエスト）
      if (!nextToken) {
        const jobListResult = yield* await jobStore.fetchJobList({
          cursor: { jobId: INITIAL_JOB_ID },
          limit: 20,
          filter: {
            companyName,
          },
        });

        const {
          jobs,
          cursor: { jobId },
        } = jobListResult;

        // JWT署名
        const signResult = yield* ResultAsync.fromPromise(
          sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15分後の有効期限
              cursor: { jobId },
            },
            jwtSecret,
          ),
          (error) =>
            createJWTSignatureError(`JWT signing failed.\n${String(error)}`),
        );

        return okAsync({ jobs, nextToken: signResult });
      }
      // nextTokenがある場合（ページネーション）
      // JWT デコード
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

      // ジョブリスト取得
      const jobListResult = yield* await jobStore.fetchJobList({
        cursor: { jobId: validatedPayload.cursor.jobId },
        limit: 20,
      });

      const {
        jobs,
        cursor: { jobId },
      } = jobListResult;

      // JWT署名
      const signResult = yield* ResultAsync.fromPromise(
        sign(
          {
            exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15分後の有効期限
            cursor: { jobId },
          },
          jwtSecret,
        ),
        (error) =>
          createJWTSignatureError(`JWT signing failed.\n${String(error)}`),
      );

      return okAsync({ jobs, nextToken: signResult });
    });

    return result.match(
      ({ jobs, nextToken }) => c.json({ jobs, nextToken }),
      (error) => {
        switch (error._tag) {
          case "JWTDecodeError":
            throw new HTTPException(400, { message: error.message });
          case "JWTSignatureError":
            throw new HTTPException(500, { message: error.message });
          case "JWTExpiredError":
            throw new HTTPException(401, { message: error.message });
          case "DecodeJWTPayloadError":
            throw new HTTPException(400, { message: error.message });
          case "FetchJobListValidationError":
            throw new HTTPException(400, { message: error.message });
          default:
            throw new HTTPException(500, { message: "internal server error" });
        }
      },
    );
  }
}
