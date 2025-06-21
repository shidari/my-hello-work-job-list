import { Effect, Layer, LogLevel, Logger } from "effect/index";
import { PlaywrightBrowserLive } from "../common/context";
import { HelloWorkCrawler, buildHelloWorkCrawlerLayer } from "./context";
import crawlingConfig from "./crawling.config";

const program = Effect.gen(function* () {
  const helloWorkCrawler = yield* HelloWorkCrawler;
  const result = yield* helloWorkCrawler.crawlJobLinks();
  return result;
});

export const MainLive = buildHelloWorkCrawlerLayer(crawlingConfig).pipe(
  Layer.provide(PlaywrightBrowserLive),
);

export const runnable = Effect.provide(program, MainLive)
  .pipe(Effect.scoped)
  .pipe(
    Logger.withMinimumLogLevel(
      crawlingConfig.debugLog ? LogLevel.Debug : LogLevel.Info,
    ),
  );
