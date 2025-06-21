import type { LaunchOptions, Page } from "playwright";
import type {
  FillOccupationFieldError,
  FillPrefectureFieldError,
  FillWorkTypeError,
  JobListPageValidationError,
  JobSearchPageValidationError,
} from "../common/error";
import type { JobNumber, JobSearchCriteria } from "../common/type";
import type {
  GoToHelloWorkSearchPageError,
  IsNextPageEnabledError,
  JobListPagenationError,
  NextJobListPageError,
  SearchThenGotoFirstJobListPageError,
} from "./error";

export type JobMetadata = {
  jobNumber: JobNumber;
};

const firstJobListPage = Symbol();

export type FirstJobListPage = Page & { [firstJobListPage]: unknown };
const jobListPage = Symbol();

export type JobListPage =
  | FirstJobListPage
  | (Page & { [jobListPage]: unknown });

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
  | GoToHelloWorkSearchPageError;

export type FillFormError =
  | FillWorkTypeError
  | FillPrefectureFieldError
  | FillOccupationFieldError;

export type ValidationError =
  | JobListPageValidationError
  | JobSearchPageValidationError;
