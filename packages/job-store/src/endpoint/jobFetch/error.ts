import { Data } from "effect";
export class FetchJobValidationError extends Data.TaggedError(
  "FetchJobValidationError",
)<{ message: string }> {}
