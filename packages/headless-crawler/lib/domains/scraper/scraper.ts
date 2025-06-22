import { Context, Effect, Layer } from "effect";
import { PlaywrightBrowser } from "../shared/context";
import type {
  GoToJobSearchPageError,
  ListJobsError,
  NewPageError,
} from "../shared/error";
import { createPage } from "../shared/helper/helper";
import { goToJobSearchPage } from "../shared/helper/pagenation";
import { validateJobSearchPage } from "../shared/helper/validator";
import type { JobNumber } from "../shared/type";
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
      | GoToJobSearchPageError
      | PageValidationError
      | FillJobNumberError
      | ListJobsError
      | ScrapeJobDataError
      | JobDetailPageValidationError
      | SearchThenGotoJobListPageError
      | FromJobListToJobDetailPageError
      | NewPageError
      | JobDetailPagePagenationError,
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
            yield* goToJobSearchPage(page);
            const searchPage = yield* validateJobSearchPage(page);
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
