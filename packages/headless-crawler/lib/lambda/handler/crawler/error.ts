import { Data } from "effect";

export class LaunchBrowserError extends Data.TaggedError("LaunchBrowserError")<{
	readonly message: string;
}> {}
export class NewPageError extends Data.TaggedError("NewPageError")<{
	readonly message: string;
}> {}
export class GoToHelloWorkSearchPageError extends Data.TaggedError(
	"GoToHelloWorkSearchPageError",
)<{ readonly message: string }> {}
export class GoToJobListError extends Data.TaggedError("GoToJobListError")<{
	readonly message: string;
}> {}
export class ListJobsError extends Data.TaggedError("ListJobsError")<{
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
export class SearchThenGotoFirstJobListPageError extends Data.TaggedError(
	"SearchThenGotoFirstJobListPageError",
)<{ readonly message: string }> {}
export class FillWorkTypeError extends Data.TaggedError("FillWorkTypeError")<{
	readonly message: string;
}> {}
export class FillPrefectureFieldError extends Data.TaggedError(
	"FillPrefectureFieldError",
)<{ readonly message: string }> {}

export class EngineeringLabelSelectorError extends Data.TaggedError(
	"EngineeringLabelSelectorError",
)<{ readonly message: string }> {}
export class FillOccupationFieldError extends Data.TaggedError(
	"FillOccupationFieldError",
)<{ readonly message: string }> {}

export class ValidateJobListPageError extends Data.TaggedError(
	"ValidateJobListPageError",
)<{ readonly message: string }> {}
export class ValidateJobSearchPageError extends Data.TaggedError(
	"ValidateJobSearchPageError",
)<{ readonly message: string }> {}
export class ExtractJobNumbersError extends Data.TaggedError(
	"ExtractJobNumbersError",
)<{ readonly message: string }> {}
