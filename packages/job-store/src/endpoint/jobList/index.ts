import type { DecodedNextToken } from "@sho/models";
import {
  jobListClientErrorResponseSchema,
  jobListQuerySchema,
  jobListServerErrorSchema,
  jobListSuccessResponseSchema,
} from "@sho/models";
import { contentJson, OpenAPIRoute } from "chanfana";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { okAsync, ResultAsync, safeTry } from "neverthrow";
import type { AppContext } from "../../app";
import { createJobStoreResultBuilder } from "../../clientImpl";
import { createJobStoreDBClientAdapter } from "../../clientImpl/adapter";
import { getDb } from "../../db";
import { createJWTSignatureError, createSchemaValidationError } from "../error";

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
      const validatedData = yield* await ResultAsync.fromPromise(
        self.getValidatedData<typeof self.schema>(),
        (error) =>
          createSchemaValidationError(
            `Fetch JobList validation failed\n${String(error)}`,
          ),
      );

      const {
        query: {
          companyName: encodedCompanyName,
          employeeCountGt,
          employeeCountLt,
          jobDescription: encodedJobDescription,
          jobDescriptionExclude: encodedJobDescriptionExclude,
          onlyNotExpired,
        },
      } = validatedData;

      const companyName = encodedCompanyName
        ? decodeURIComponent(encodedCompanyName)
        : undefined;
      const jobDescription = encodedJobDescription
        ? decodeURIComponent(encodedJobDescription)
        : undefined;

      const jobDescriptionExclude = encodedJobDescriptionExclude
        ? decodeURIComponent(encodedJobDescriptionExclude)
        : undefined;

      const jwtSecret = c.env.JWT_SECRET;

      const db = getDb(c);
      const dbClient = createJobStoreDBClientAdapter(db);
      const jobStore = createJobStoreResultBuilder(dbClient);

      const limit = 20;
      const jobListResult = yield* await jobStore.fetchJobList({
        cursor: { jobId: INITIAL_JOB_ID },
        limit,
        filter: {
          companyName,
          employeeCountGt,
          employeeCountLt,
          jobDescription,
          jobDescriptionExclude,
          onlyNotExpired,
        },
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

      const nextToken = yield* (() => {
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

      return okAsync({ jobs, nextToken, meta });
    });

    return await result.match(
      ({ jobs, nextToken, meta }) => c.json({ jobs, nextToken, meta }),
      (error) => {
        console.error(error);

        switch (error._tag) {
          case "JWTSignatureError":
            throw new HTTPException(500, { message: error.message });
          case "ResponseSchemaValidationError":
            throw new HTTPException(400, { message: error.message });
          default:
            throw new HTTPException(500, { message: "internal server error" });
        }
      },
    );
  }
}
