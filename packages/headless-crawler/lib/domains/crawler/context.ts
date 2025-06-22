import { Chunk, Context, Effect, Layer, Stream } from "effect";
import { PlaywrightBrowser } from "../shared/context";
import type {
  EmploymentLabelToSelectorError,
  EngineeringLabelSelectorError,
  ExtractJobNumbersError,
  ListJobsError,
} from "../shared/error";
import { createPage } from "../shared/helper/helper";
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
      const { launchBrower, closeBrowesr } = yield* PlaywrightBrowser;
      const browser = yield* Effect.acquireRelease(
        launchBrower({ ...config.browserConfig }),
        closeBrowesr,
      );
      const page = yield* createPage(browser);
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
