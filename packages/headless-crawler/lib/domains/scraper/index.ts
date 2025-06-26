import { Effect, Layer, LogLevel, Logger } from "effect";
import { PlaywrightBrowserLive } from "../shared/context";
import { validateJobNumber } from "../shared/helper/validator";
import { HelloWorkScraper, buildHelloWorkScrapingLayer } from "./scraper";
import config from "./scraping.config";
export function buildScrapingRunner(rawJobNumber: string) {
  return Effect.gen(function* () {
    const config2 = yield* Effect.promise(() => config);
    const layer = Layer.provideMerge(
      buildHelloWorkScrapingLayer(config2),
      PlaywrightBrowserLive,
    );

    const program = Effect.gen(function* () {
      const jobNumber = yield* validateJobNumber(rawJobNumber);
      const scraper = yield* HelloWorkScraper;
      const jobInfo = yield* scraper.scrapeJobData(jobNumber);
      return jobInfo;
    });
    return yield* Effect.provide(program, layer)
      .pipe(Effect.scoped)
      .pipe(
        Logger.withMinimumLogLevel(
          config2.debugLog ? LogLevel.Debug : LogLevel.Info,
        ),
      );
  });
}
