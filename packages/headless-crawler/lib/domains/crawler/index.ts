import { Effect, Layer, LogLevel, Logger } from "effect/index";
import { HelloWorkCrawler, buildHelloWorkCrawlerLayer } from "./context";
import crawlingConfig from "./crawling.config";

export const crawlerRunnable = Effect.gen(function* () {
  const config = yield* Effect.promise(() => crawlingConfig);
  const layer = buildHelloWorkCrawlerLayer(config);
  const program = Effect.gen(function* () {
    const helloWorkCrawler = yield* HelloWorkCrawler;
    const result = yield* helloWorkCrawler.crawlJobLinks();
    return result;
  });
  return yield* Effect.provide(program, layer)
    .pipe(Effect.scoped)
    .pipe(
      Logger.withMinimumLogLevel(
        config.debugLog ? LogLevel.Debug : LogLevel.Info,
      ),
    );
});
