import type { JobInfo, JobNumber } from "@sho/schema";
import { Context, Effect, Layer } from "effect";
import type { ListJobsError, NewPageError } from "../shared/error";
import {
  createContext,
  createPage,
  launchBrowser,
} from "../shared/helper/helper";
import {
  goToJobSearchPage,
  searchThenGotoJobListPage,
} from "../shared/helper/pagenation";
import {
  validateJobListPage,
  validateJobSearchPage,
} from "../shared/helper/validator";
import type { SelectorConverterError } from "../shared/type";
import type {
  AssertSingleJobListedError,
  ScrapeJobDataError,
} from "./scraper-error";
import { extractJobInfo } from "./scraper-extractor";
import { goToSingleJobDetailPage } from "./scraper-pagenation";
import type {
  ExtractTextContentOnScrapingError,
  HelloWorkScrapingConfig,
  JobFieldFillingOnScrapingError,
  PagenationOnScrapingError,
  ValidationOnScrapingError,
} from "./scraper-type";
import { validateJobDetailPage } from "./scraper-validator";

export class HelloWorkScraper extends Context.Tag("HelloWorkScraper")<
  HelloWorkScraper,
  {
    readonly scrapeJobData: (
      jobNumber: JobNumber,
    ) => Effect.Effect<
      JobInfo,
      | ExtractTextContentOnScrapingError
      | ValidationOnScrapingError
      | ListJobsError
      | ScrapeJobDataError
      | NewPageError
      | AssertSingleJobListedError
      | PagenationOnScrapingError
      | SelectorConverterError
      | JobFieldFillingOnScrapingError
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
      const browser = yield* launchBrowser(config.browserConfig);
      const context = yield* createContext(browser);
      const page = yield* createPage(context);
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
            yield* searchThenGotoJobListPage(searchPage, { jobNumber });
            const jobListPage = yield* validateJobListPage(searchPage);
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
