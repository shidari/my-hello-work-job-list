import { Effect, LogLevel, Logger } from "effect";
import { validateJobNumber } from "../shared/helper/validator";
import { HelloWorkScraper, buildHelloWorkScrapingLayer } from "./scraper";
import scrapingConfig from "./scraping.config";
export function buildScrapingRunner(rawJobNumber: string) {
  return Effect.gen(function* () {
    const config = yield* Effect.promise(() => scrapingConfig);
    const layer = buildHelloWorkScrapingLayer(config);

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
          config.debugLog ? LogLevel.Debug : LogLevel.Info,
        ),
      );
  });
}
