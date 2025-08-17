import { jobListSuccessResponseSchema, type SearchFilter } from "@sho/models";
import { err, ok, okAsync, ResultAsync, safeTry } from "neverthrow";
import type { JobStoreClient } from "../type";

export const jobStoreClientOnBrowser: JobStoreClient = {
  getInitialJobs(filter: SearchFilter = {}) {
    const searchParams = new URLSearchParams();
    if (filter.companyName) {
      searchParams.append("companyName", filter.companyName);
    }
    if (filter.employeeCountGt) {
      searchParams.append("employeeCountGt", String(filter.employeeCountGt));
    }
    if (filter.employeeCountLt) {
      searchParams.append("employeeCountLt", String(filter.employeeCountLt));
    }

    if (filter.jobDescription) {
      searchParams.append("jobDescription", filter.jobDescription);
    }

    if (filter.jobDescriptionExclude) {
      searchParams.append(
        "jobDescriptionExclude",
        filter.jobDescriptionExclude,
      );
    }
    return safeTry(async function* () {
      const response = yield* ResultAsync.fromPromise(
        fetch(
          `/api/proxy/job-store/jobs${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
        ),
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
  getContinuedJobs(nextToken: string) {
    return safeTry(async function* () {
      const response = yield* ResultAsync.fromPromise(
        fetch(`/api/proxy/job-store/jobs/continue?nextToken=${nextToken}`),
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
