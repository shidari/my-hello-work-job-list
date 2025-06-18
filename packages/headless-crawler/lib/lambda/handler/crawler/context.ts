import { Chunk, Context, Effect, Layer, Stream } from "effect";
import { type Browser, type LaunchOptions, chromium } from "playwright";
import {
	type EngineeringLabelSelectorError,
	type ExtractJobNumbersError,
	LaunchBrowserError,
	type ListJobsError,
} from "./error";
import {
	goToHelloWorkSearchPage,
	searchThenGotoJobListPage,
} from "./helper/hellowork/pagenation";
import {
	fetchJobMetaData,
	validateJobListPage,
	validateJobSearchPage,
} from "./helper/hellowork/util";
import { createPage } from "./helper/playwright";
import type {
	FillFormError,
	HelloWorkCrawlingConfig,
	JobMetadata,
	PagenationError,
	ValidationError,
} from "./type";

export class PlaywrightBrowser extends Context.Tag("PlaywrightBrowser")<
	PlaywrightBrowser,
	{
		readonly launchBrower: (
			options: LaunchOptions,
		) => Effect.Effect<Browser, LaunchBrowserError>;
		readonly closeBrowesr: (browser: Browser) => Effect.Effect<void>;
	}
>() {}

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
