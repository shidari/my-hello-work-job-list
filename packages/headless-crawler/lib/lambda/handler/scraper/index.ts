import { Effect, Layer, LogLevel, Logger } from "effect";
import { PlaywrightBrowserLive } from "../common/context";
import { validateJobNumber } from "../common/helper";
import { HelloWorkScraper, buildHelloWorkScrapingLayer } from "./scraper";
import config from "./scraping.config";

export function buildScrapingRunner(rawJobNumber: string) {
  const layer = Layer.provideMerge(
    buildHelloWorkScrapingLayer(config),
    PlaywrightBrowserLive,
  );

  const program = Effect.gen(function* () {
    const jobNumber = yield* validateJobNumber(rawJobNumber);
    const scraper = yield* HelloWorkScraper;
    const jobInfo = yield* scraper.scrapeJobData(jobNumber);
    return jobInfo;
  });
  return Effect.provide(program, layer)
    .pipe(Effect.scoped)
    .pipe(
      Logger.withMinimumLogLevel(
        config.debugLog ? LogLevel.Debug : LogLevel.Info,
      ),
    );
}
