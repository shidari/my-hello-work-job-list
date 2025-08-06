import { jobListSuccessResponseSchema } from "@sho/models";
import { ResultAsync, err, ok, okAsync, safeTry } from "neverthrow";

const j = Symbol();
type JobEndPoint = { [j]: unknown } & string;
export const jobStoreClient = {
  async getJobs(nextToken?: string) {
    return safeTry(async function* () {
      const endpoint = yield* (() => {
        const envEndpoint = process.env.JOB_STORE_ENDPOINT;
        if (!envEndpoint) {
          return err(new Error("JOB_STORE_ENDPOINT is not defined"));
        }
        return ok(envEndpoint as JobEndPoint);
      })();

      const url = nextToken
        ? `${endpoint}/jobs?nextToken=${nextToken}`
        : `${endpoint}/jobs`;

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
