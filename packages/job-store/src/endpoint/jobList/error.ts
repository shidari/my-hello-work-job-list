import { Data } from "effect";
export class GetJWTSecretError extends Data.TaggedError("GetJWTSecretError")<{
  message: string;
}> {}
export class FetchJobListValidationError extends Data.TaggedError(
  "FetchJobListValidationError",
)<{ message: string }> {}
export class JWTSignatureError extends Data.TaggedError("JWTSignatureError")<{
  message: string;
}> {}
export class JWTDecodeError extends Data.TaggedError("JWTDecodeError")<{
  message: string;
}> {}
export class JWTExpiredError extends Data.TaggedError("JWTExpiredError")<{
  message: string;
}> {}
export class DecodeJWTPayloadError extends Data.TaggedError(
  "DecodeJWTPayloadError",
)<{ message: string }> {}
