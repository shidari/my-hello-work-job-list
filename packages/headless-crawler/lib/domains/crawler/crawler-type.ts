import type {
  FillOccupationFieldError,
  FillPrefectureFieldError,
  FillWorkTypeError,
  GoToJobSearchPageError,
  JobListPageValidationError,
  JobNumberValidationError,
  JobSearchPageValidationError,
  SearchThenGotoFirstJobListPageError,
} from "../shared/error";
import type {
  IsNextPageEnabledError,
  JobListPagenationError,
  NextJobListPageError,
} from "./crawler-error";

export type PagenationError =
  | JobListPagenationError
  | NextJobListPageError
  | SearchThenGotoFirstJobListPageError
  | IsNextPageEnabledError
  | GoToJobSearchPageError;

export type FillFormError =
  | FillWorkTypeError
  | FillPrefectureFieldError
  | FillOccupationFieldError;

export type ValidationError =
  | JobListPageValidationError
  | JobSearchPageValidationError
  | JobNumberValidationError;
