import type { LaunchOptions, Page } from "playwright";
import type {
  FillOccupationFieldError,
  FillPrefectureFieldError,
  FillWorkTypeError,
  GoToJobSearchPageError,
  JobListPageValidationError,
  JobNumberValidationError,
  JobSearchPageValidationError,
} from "../shared/error";
import type { JobNumber, JobSearchCriteria } from "../shared/type";
import type {
  IsNextPageEnabledError,
  JobListPagenationError,
  NextJobListPageError,
  SearchThenGotoFirstJobListPageError,
} from "./error";

export type JobMetadata = {
  jobNumber: JobNumber;
};

export type NewJobOpeningsFilter = "TodayYesterday" | "Within1Week";
export type HelloWorkCrawlingConfig = {
  roughMaxCount: number;
  browserConfig: Pick<LaunchOptions, "headless">;
  debugLog: boolean;
  nextPageDelayMs: number;
  jobSearchCriteria: JobSearchCriteria;
};

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
