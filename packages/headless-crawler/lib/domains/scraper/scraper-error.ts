import { Data } from "effect";

export class FillJobNumberError extends Data.TaggedError("FillJobNumberError")<{
  readonly message: string;
}> {}
export class SearchThenGotoJobListPageError extends Data.TaggedError(
  "SearchThenGotoJobListPageError",
)<{
  readonly message: string;
}> {}
export class FromJobListToJobDetailPageError extends Data.TaggedError(
  "FromJobListToJobDetailPageError",
)<{
  readonly message: string;
}> {}
export class ScrapeJobDataError extends Data.TaggedError("ScrapeJobDataError")<{
  readonly message: string;
}> {}

export class AssertSingleJobListedError extends Data.TaggedError(
  "AssertSingleJobListedError",
)<{ readonly message: string }> {}
export class JobDetailPageValidationError extends Data.TaggedError(
  "JobDetailPageValidationError",
)<{ readonly message: string }> {}
export class ExtractJobInfoError extends Data.TaggedError(
  "ExtractJobInfoError",
)<{ readonly message: string }> {}
export class ExtractJobCompanyNameError extends Data.TaggedError(
  "ExtractJobCompanyName",
)<{ readonly message: string }> {}
export class ExtractReceivedDateError extends Data.TaggedError(
  "ExtractReceivedDateError",
)<{ readonly message: string }> {}
export class ExtractExpiryDateError extends Data.TaggedError(
  "ExtractExpiryDateError",
)<{ readonly message: string }> {}
export class ExtractHomePageError extends Data.TaggedError(
  "ExtractHomePageError",
)<{ readonly message: string }> {}
export class ExtractOccupationError extends Data.TaggedError(
  "ExtractOccupationError",
)<{ readonly message: string }> {}
export class ExtractEmployMentTypeError extends Data.TaggedError(
  "ExtractEmployMentTypeError",
)<{ readonly message: string }> {}
export class ExtractWageError extends Data.TaggedError("ExtractWageError")<{
  readonly message: string;
}> {}
export class ExtractWorkingHoursError extends Data.TaggedError(
  "ExtractWorkingHoursError",
)<{
  readonly message: string;
}> {}
export class ExtractEmployeeCountError extends Data.TaggedError(
  "ExtractEmployeeCountError",
)<{
  readonly message: string;
}> {}
export class ExtractWorkPlaceError extends Data.TaggedError(
  "ExtractWorkPlaceError",
)<{
  readonly message: string;
}> {}
export class ExtractJobDescriptionError extends Data.TaggedError(
  "ExtractJobDescriptionError",
)<{
  readonly message: string;
}> {}
export class ExtractQualificationsError extends Data.TaggedError(
  "ExtractQualificationsError",
)<{
  readonly message: string;
}> {}

export class JobDetailPagePagenationError extends Data.TaggedError(
  "JobDetailPagePagenationError",
)<{ readonly message: string }> {}
