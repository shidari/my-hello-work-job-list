import { Chunk, Context, Effect, Layer, Stream } from "effect";
import { PlaywrightBrowser } from "../common/context";
import type { ExtractJobNumbersError, ListJobsError } from "../common/error";
import {
  createPage,
  goToHelloWorkSearchPage,
  validateJobListPage,
  validateJobSearchPage,
} from "../common/helper";
import type { EngineeringLabelSelectorError } from "./error";
import { searchThenGotoJobListPage } from "./helper/hellowork/pagenation";
import { fetchJobMetaData } from "./helper/hellowork/util";
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
            yield* Effect.gen(function* () {
              yield* goToHelloWorkSearchPage(page);
              const searchPage = yield* validateJobSearchPage(page);
              yield* searchThenGotoJobListPage(
                searchPage,
                config.jobSearchCriteria,
              );
            });

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
