import { Chunk, Context, Effect, Layer, Stream } from "effect";
import type {
  EmploymentLabelToSelectorError,
  EngineeringLabelSelectorError,
  ExtractJobNumbersError,
  ListJobsError,
} from "../shared/error";
import {
  createContext,
  createPage,
  launchBrowser,
} from "../shared/helper/helper";
import { goToJobSearchPage } from "../shared/helper/pagenation";
import {
  validateJobListPage,
  validateJobSearchPage,
} from "../shared/helper/validator";
import { fetchJobMetaData } from "./helper/hellowork/fetcher";
import { searchThenGotoJobListPage } from "./helper/hellowork/pagenation";
import type {
  FillFormError,
  HelloWorkCrawlingConfig,
  JobMetadata,
  PagenationError,
  ValidationError,
} from "./type";
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
