import { jobListSuccessResponseSchema, type SearchFilter } from "@sho/models";
import { err, ok, okAsync, ResultAsync, safeTry } from "neverthrow";

const j = Symbol();
type JobEndPoint = { [j]: unknown } & string;
export const jobStoreClient = {
  async getJobs(nextToken?: string, filter: SearchFilter = {}) {
    return safeTry(async function* () {
      const endpoint = yield* (() => {
        const envEndpoint = process.env.JOB_STORE_ENDPOINT;
        if (!envEndpoint) {
          return err(new Error("JOB_STORE_ENDPOINT is not defined"));
        }
        return ok(envEndpoint as JobEndPoint);
      })();

      const searchParams = new URLSearchParams();
      if (filter.companyName) {
        searchParams.append(
          "companyName",
          encodeURIComponent(filter.companyName),
        );
      }

      if (nextToken) {
        searchParams.append("nextToken", nextToken);
      }

      const url = `${endpoint}/jobs${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

      const response = yield* ResultAsync.fromPromise(
        fetch(url),
        (error) => new Error(`Failed to fetch jobs: ${String(error)}`),
      );
      const data = yield* ResultAsync.fromPromise(
        response.json(),
        (error) => new Error(`Failed to parse jobs response: ${String(error)}`),
      );

      const validatedData = yield* (() => {
        const result = jobListSuccessResponseSchema.safeParse(data);
        if (!result.success) {
          return err(new Error(`Invalid job data: ${result.error.message}`));
        }
        return ok(result.data);
      })();
      return okAsync(validatedData);
    });
  },
};
