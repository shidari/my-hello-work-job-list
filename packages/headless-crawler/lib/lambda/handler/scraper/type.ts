import type { LaunchOptions, Page } from "playwright";
import type {
  JobListPageValidationError,
  JobNumberValidationError,
  JobSearchPageValidationError,
} from "../common/error";
import type { JobNumber } from "../common/type";
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
  HomePageValidationError,
  ReceivedDateValidationError,
} from "./error";
export type HelloWorkScrapingConfig = {
  browserConfig: Pick<LaunchOptions, "headless">;
  debugLog: boolean;
};

export function defineHelloWorkScrapingConfig(
  config: HelloWorkScrapingConfig,
): HelloWorkScrapingConfig {
  return config;
}

const r = Symbol();
export type ReceivedDate = string & { [r]: unknown };

const h = Symbol();
export type HomePage = string & { [h]: unknown };

const e = Symbol();
export type ExpiryDate = string & { [e]: unknown };

const ec = Symbol();
export type EmployeetCount = number & { [ec]: unknown };
export type JobInfo = {
  jobNumber: JobNumber;
  companyName: string;
  receivedDate: ReceivedDate;
  expiryDate: ExpiryDate;
  homePage: HomePage;
  occupation: string;
  employmentType: string;
  wage: string;
  workingHours: string;
  employeeCount: EmployeetCount;
};

const jobDetailPage = Symbol();
export type JobDetailPage = Page & { [jobDetailPage]: unknown };

export type JobDetailPageContentValidationError =
  | ReceivedDateValidationError
  | ExpiryDateValidationError
  | HomePageValidationError
  | JobNumberValidationError
  | EmployeeCountValidationError;

export type ExtractTextContentError =
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

export type PageValidationError =
  | JobSearchPageValidationError
  | JobDetailPageContentValidationError
  | JobListPageValidationError;
