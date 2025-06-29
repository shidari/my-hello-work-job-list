import { Data } from "effect";

export class GoToJobListError extends Data.TaggedError("GoToJobListError")<{
  readonly message: string;
}> {}

export class NextJobListPageError extends Data.TaggedError(
  "NextJobListPageError",
)<{ readonly message: string }> {}
export class JobListPagenationError extends Data.TaggedError(
  "JobListPagenationError",
)<{ readonly message: string }> {}
export class IsNextPageEnabledError extends Data.TaggedError(
  "IsNextPageEnabledError",
)<{ readonly message: string }> {}
