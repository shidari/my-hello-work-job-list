import type { JobMetadata } from "@sho/schema";
import { Chunk, Context, Effect, Layer, Stream } from "effect";
import type {
  EmploymentLabelToSelectorError,
  EngineeringLabelSelectorError,
  ExtractJobNumbersError,
  ListJobsError,
  SearchThenGotoJobListPageError,
} from "../shared/error";
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
import type {
  FillFormError,
  PagenationError,
  ValidationError,
} from "./crawler-type";
import type { HelloWorkCrawlingConfig } from "./crawling.config";
import { fetchJobMetaData } from "./helper/hellowork/crawler-fetcher";
export class HelloWorkCrawler extends Context.Tag("HelloWorkCrawler")<
  HelloWorkCrawler,
  {
    readonly crawlJobLinks: () => Effect.Effect<
      JobMetadata[],
      | ListJobsError
      | EngineeringLabelSelectorError
      | ValidationError
      | FillFormError
      | PagenationError
      | ExtractJobNumbersError
      | EmploymentLabelToSelectorError
      | SearchThenGotoJobListPageError
    >;
  }
>() {}

export const buildHelloWorkCrawlerLayer = (config: HelloWorkCrawlingConfig) => {
  return Layer.effect(
    HelloWorkCrawler,
    Effect.gen(function* () {
      yield* Effect.logInfo(
        `building crawler: config=${JSON.stringify(config, null, 2)}`,
      );
      const browser = yield* launchBrowser(config.browserConfig);
      const context = yield* createContext(browser);
      const page = yield* createPage(context);
      return HelloWorkCrawler.of({
        crawlJobLinks: () =>
          Effect.gen(function* () {
            yield* Effect.logInfo("start crawling...");
            yield* goToJobSearchPage(page);
            const searchPage = yield* validateJobSearchPage(page);
            yield* searchThenGotoJobListPage(
              searchPage,
              config.jobSearchCriteria,
            );
            const jobListPage = yield* validateJobListPage(page);
            const initialCount = 0;
            const stream = Stream.paginateChunkEffect(
              {
                jobListPage,
                count: initialCount,
                roughMaxCount: config.roughMaxCount,
                nextPageDelayMs: config.nextPageDelayMs,
              },
              fetchJobMetaData,
            );
            const chunk = yield* Stream.runCollect(stream);
            const jobLinks = Chunk.toArray(chunk);
            yield* Effect.logInfo(
              `crawling finished. total: ${jobLinks.length}`,
            );
            return jobLinks;
          }),
      });
    }),
  );
};
