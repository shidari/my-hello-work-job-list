import { Data } from "effect";

export class SafeParseEventBodyError extends Data.TaggedError(
  "SafeParseEventBodyError",
)<{
  readonly message: string;
}> {}
export class ToFirstRecordError extends Data.TaggedError("ToFirstRecordError")<{
  readonly message: string;
}> {}
