import { Context, Effect, Layer } from "effect";
import { type Browser, type LaunchOptions, chromium } from "playwright";
import { LaunchBrowserError } from "./error";

export class PlaywrightBrowser extends Context.Tag("PlaywrightBrowser")<
  PlaywrightBrowser,
  {
    readonly launchBrower: (
      options: LaunchOptions,
    ) => Effect.Effect<Browser, LaunchBrowserError>;
    readonly closeBrowesr: (browser: Browser) => Effect.Effect<void>;
  }
>() {}

export const PlaywrightBrowserLive = Layer.succeed(
  PlaywrightBrowser,
  PlaywrightBrowser.of({
    launchBrower: (options: LaunchOptions = {}) =>
      Effect.tryPromise({
        try: async () => {
          const browser = await chromium.launch(options);
          return browser;
        },
        catch: (e) =>
          new LaunchBrowserError({
            message: `unexpected error.\n${String(e)}`,
          }),
      }),
    closeBrowesr: (browser) => Effect.promise(() => browser.close()),
  }),
);
