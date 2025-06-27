import type { LaunchOptions, Page } from "playwright";
import type { SearchThenGotoFirstJobListPageError } from "../crawler/error";
import type {
  GoToJobSearchPageError,
  JobListPageValidationError,
  JobNumberValidationError,
  JobSearchPageValidationError,
} from "../shared/error";
import type { JobFieldFillingError, JobNumber } from "../shared/type";
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
} from "./error";
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

type JobDetailPageContentValidationError =
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
