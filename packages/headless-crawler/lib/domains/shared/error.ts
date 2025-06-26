import { Data } from "effect";

export class LaunchBrowserError extends Data.TaggedError("LaunchBrowserError")<{
  readonly message: string;
}> {}
export class NewPageError extends Data.TaggedError("NewPageError")<{
  readonly message: string;
}> {}
export class NewContextError extends Data.TaggedError("NewContextError")<{
  readonly message: string;
}> {}

export class JobSearchPageValidationError extends Data.TaggedError(
  "JobSearchPageValidationError",
)<{ readonly message: string }> {}

export class FillWorkTypeError extends Data.TaggedError("FillWorkTypeError")<{
  readonly message: string;
}> {}
export class FillPrefectureFieldError extends Data.TaggedError(
  "FillPrefectureFieldError",
)<{ readonly message: string }> {}

export class FillOccupationFieldError extends Data.TaggedError(
  "FillOccupationFieldError",
)<{ readonly message: string }> {}

export class ListJobsError extends Data.TaggedError("ListJobsError")<{
  readonly message: string;
}> {}

export class ExtractJobNumbersError extends Data.TaggedError(
  "ExtractJobNumbersError",
)<{ readonly message: string }> {}

export class JobNumberValidationError extends Data.TaggedError(
  "JobNumberValidationError",
)<{
  readonly message: string;
}> {}
export class JobListPageValidationError extends Data.TaggedError(
  "JobListPageValidationError",
)<{ readonly message: string }> {}
export class EmploymentLabelToSelectorError extends Data.TaggedError(
  "EmploymentLabelToSelectorError",
)<{
  readonly message: string;
}> {}
export class EngineeringLabelSelectorError extends Data.TaggedError(
  "EngineeringLabelSelectorError",
)<{ readonly message: string }> {}
export class GoToJobSearchPageError extends Data.TaggedError(
  "GoToJobSearchPageError",
)<{ readonly message: string }> {}
