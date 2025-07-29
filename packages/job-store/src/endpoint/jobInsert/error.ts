import { Data } from "effect";

type ErrorType = "client" | "server";
export class InsertJobRequestValidationError extends Data.TaggedError(
  "ValidationError",
)<{ message: string; errorType: ErrorType }> {}
export class InsertJobDuplicationError extends Data.TaggedError(
  "InsertJobDuplicationError",
)<{ message: string; errorType: ErrorType }> {}
export class InsertJobError extends Data.TaggedError("InsertJobError")<{
  message: string;
  errorType: ErrorType;
}> {}
