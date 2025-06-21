import { Context, Effect, Layer } from "effect";
import { PlaywrightBrowser } from "../common/context";
import type {
  GetOriginError,
  ListJobsError,
  NewPageError,
  ResolveURLError,
} from "../common/error";
import {
  createPage,
  goToHelloWorkSearchThenReturnPage,
} from "../common/helper";
import type { JobNumber } from "../common/type";
import type { GoToHelloWorkSearchPageError } from "../crawler/error";
import type {
  FillJobNumberError,
  FromJobListToJobDetailPageError,
  JobDetailPagePagenationError,
  JobDetailPageValidationError,
  ScrapeJobDataError,
  SearchThenGotoJobListPageError,
} from "./error";
import { extractJobInfo } from "./extractor";
import {
  goToSingleJobDetailPage,
  searchThenGotoJobListThenReturnPage,
} from "./pagenation";
import type {
  ExtractTextContentError,
  HelloWorkScrapingConfig,
  JobDetailPageContentValidationError,
  JobInfo,
  PageValidationError,
} from "./type";
import { validateJobDetailPage } from "./validator";

export class HelloWorkScraper extends Context.Tag("HelloWorkScraper")<
  HelloWorkScraper,
  {
    readonly scrapeJobData: (
      jobNumber: JobNumber,
    ) => Effect.Effect<
      JobInfo,
      | ExtractTextContentError
      | JobDetailPageContentValidationError
      | GoToHelloWorkSearchPageError
      | PageValidationError
      | FillJobNumberError
      | ListJobsError
      | ScrapeJobDataError
      | JobDetailPageValidationError
      | SearchThenGotoJobListPageError
      | FromJobListToJobDetailPageError
      | NewPageError
      | JobDetailPagePagenationError
      | GetOriginError
      | ResolveURLError,
      PlaywrightBrowser
    >;
  }
>() {}

export function buildHelloWorkScrapingLayer(config: HelloWorkScrapingConfig) {
  return Layer.effect(
    HelloWorkScraper,
    Effect.gen(function* () {
      yield* Effect.logInfo(
        `building scraper: config=${JSON.stringify(config, null, 2)}`,
      );
      const { launchBrower, closeBrowesr } = yield* PlaywrightBrowser;
      const browser = yield* Effect.acquireRelease(
        launchBrower({ ...config.browserConfig }),
        closeBrowesr,
      );
      const page = yield* createPage(browser);
      return HelloWorkScraper.of({
        scrapeJobData: (jobNumber: JobNumber) =>
          Effect.gen(function* () {
            yield* Effect.logInfo("start scrapling...");
            yield* Effect.logDebug("go to hello work seach page.");
            const searchPage = yield* goToHelloWorkSearchThenReturnPage(page);
            yield* Effect.logDebug(
              "fill jobNumber then go to hello work seach page.",
            );
            const jobListPage = yield* searchThenGotoJobListThenReturnPage(
              searchPage,
              jobNumber,
            );
            yield* Effect.logDebug("now on job List page.");

            yield* goToSingleJobDetailPage(jobListPage);
            const jobDetailPage = yield* validateJobDetailPage(jobListPage);
            const jobInfo = yield* extractJobInfo(jobDetailPage);
            return jobInfo;
          }),
      });
    }),
  );
}
