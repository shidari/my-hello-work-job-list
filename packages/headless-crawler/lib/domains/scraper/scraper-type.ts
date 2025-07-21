import type { LaunchOptions } from "playwright";
import type {
  CompanyNameValidationError,
  EmployeeCountValidationError,
  EmploymentTypeValidationError,
  ExpiryDateValidationError,
  GoToJobSearchPageError,
  HomePageValidationError,
  JobDescriptionValidationError,
  JobListPageValidationError,
  JobNumberValidationError,
  JobSearchPageValidationError,
  OccupationValidationError,
  QualificationValidationError,
  ReceivedDateValidationError,
  SearchThenGotoFirstJobListPageError,
  WageValidationError,
  WorkPlaceValidationError,
  WorkingHoursValidationError,
} from "../shared/error";
import type { JobFieldFillingError } from "../shared/type";
import type {
  ExtractEmployMentTypeError,
  ExtractEmployeeCountError,
  ExtractExpiryDateError,
  ExtractHomePageError,
  ExtractJobCompanyNameError,
  ExtractJobDescriptionError,
  ExtractJobInfoError,
  ExtractOccupationError,
  ExtractQualificationsError,
  ExtractReceivedDateError,
  ExtractWageError,
  ExtractWorkPlaceError,
  ExtractWorkingHoursError,
  FillJobNumberError,
  FromJobListToJobDetailPageError,
  JobDetailPagePagenationError,
  JobDetailPageValidationError,
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
  | ExtractEmployeeCountError
  | ExtractWorkPlaceError
  | ExtractJobDescriptionError
  | ExtractQualificationsError;

export type JobPropertyValidationError =
  | JobNumberValidationError
  | CompanyNameValidationError
  | ReceivedDateValidationError
  | ExpiryDateValidationError
  | HomePageValidationError
  | OccupationValidationError
  | EmploymentTypeValidationError
  | WageValidationError
  | WorkingHoursValidationError
  | EmployeeCountValidationError
  | WorkPlaceValidationError
  | JobDescriptionValidationError
  | QualificationValidationError;

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
