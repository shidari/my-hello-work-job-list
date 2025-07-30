import { Data } from "effect";

export class JobNotFoundError extends Data.TaggedError("JobNotFoundError")<{
  message: string;
}> {}

export class FetchJobError extends Data.TaggedError("FetchJobError")<{
  message: string;
}> {}
