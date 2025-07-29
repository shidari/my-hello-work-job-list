import type { InsertJobRequestBody } from "./jobInsert";

type Result<T, E> = { _tag: "Ok"; value: T } | { _tag: "Err"; error: E };

type ErrorType = "client" | "server";

export type InsertJobRequestValidationError = {
  _tag: "Err";
  error: { message: string; errorType: ErrorType };
};
export type InsertJobDuplicationError = {
  _tag: "Err";
  error: { message: string; errorType: ErrorType };
};
export type InsertJobError = {
  _tag: "Err";
  error: { message: string; errorType: ErrorType };
};
export interface JobStoreResultService {
  readonly insertJob: (
    job: InsertJobRequestBody,
  ) => Result<InsertJobRequestBody, InsertJobDuplicationError | InsertJobError>;

  readonly checkDuplicate: (
    jobNumber: string,
  ) => Result<boolean, InsertJobDuplicationError>;
}
