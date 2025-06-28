import type { LaunchOptions } from "playwright";
import type { SearchThenGotoFirstJobListPageError } from "../crawler/crawler-error";
import type {
  GoToJobSearchPageError,
  JobListPageValidationError,
  JobNumberValidationError,
  JobSearchPageValidationError,
} from "../shared/error";
import type { JobFieldFillingError } from "../shared/type";
import type {
  EmployeeCountValidationError,
  ExpiryDateValidationError,
  ExtractEmployMentTypeError,
  ExtractEmployeeCountError,
  ExtractExpiryDateError,
  ExtractHomePageError,
  ExtractJobCompanyNameError,
  ExtractJobInfoError,
  ExtractOccupationError,
  ExtractReceivedDateError,
  ExtractWageError,
  ExtractWorkingHoursError,
  FillJobNumberError,
  FromJobListToJobDetailPageError,
  HomePageValidationError,
  JobDetailPagePagenationError,
  JobDetailPageValidationError,
  ReceivedDateValidationError,
  SearchThenGotoJobListPageError,
} from "./scraper-error";
export type HelloWorkScrapingConfig = {
  browserConfig: Pick<LaunchOptions, "headless" | "executablePath" | "args">;
  debugLog: boolean;
};

export async function defineHelloWorkScrapingConfig(
  config:
    | HelloWorkScrapingConfig
    | Promise<HelloWorkScrapingConfig>
    | (() => HelloWorkScrapingConfig | HelloWorkScrapingConfig)
    | (() => HelloWorkScrapingConfig | Promise<HelloWorkScrapingConfig>),
): Promise<HelloWorkScrapingConfig> {
  if (typeof config === "function") {
    return await config();
  }
  return await config;
}

export type JobDetailPageContentValidationError =
  | ReceivedDateValidationError
  | ExpiryDateValidationError
  | HomePageValidationError
  | JobNumberValidationError
  | EmployeeCountValidationError;

export type ExtractTextContentOnScrapingError =
  | ExtractJobInfoError
  | ExtractJobCompanyNameError
  | ExtractReceivedDateError
  | ExtractExpiryDateError
  | ExtractHomePageError
  | ExtractOccupationError
  | ExtractEmployMentTypeError
  | ExtractWageError
  | ExtractWorkingHoursError
  | ExtractEmployeeCountError;

export type ValidationOnScrapingError =
  | PageValidationError
  | JobDetailPageContentValidationError;
type PageValidationError =
  | JobSearchPageValidationError
  | JobListPageValidationError
  | JobDetailPageValidationError;

export type JobFieldFillingOnScrapingError =
  | JobFieldFillingError
  | FillJobNumberError;

export type PagenationOnScrapingError =
  | GoToJobSearchPageError
  | SearchThenGotoJobListPageError
  | FromJobListToJobDetailPageError
  | JobDetailPagePagenationError
  | SearchThenGotoFirstJobListPageError;
