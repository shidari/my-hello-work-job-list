import { Chunk, Effect, Option } from "effect";
import type { Page } from "playwright";
import crawlingConfig from "../../crawling.config";
import {
	EngineeringLabelSelectorError,
	ExtractJobNumbersError,
	IsNextPageEnabledError,
	ListJobsError,
	ValidateJobListPageError,
	ValidateJobSearchPageError,
} from "../../error";
import type {
	EngineeringLabel,
	EngineeringLabelSelector,
	EngineeringLabelSelectorOpenerSibling,
	EngineeringLabelSelectorRadioBtn,
	HelloWorkSearchPage,
	JobListPage,
	JobNumber,
	JobOverViewList,
} from "../../type";
import { delay } from "../util";
import { goToNextJobListPage } from "./pagenation";

export function listJobOverviewElem(jobListPage: JobListPage) {
	return Effect.tryPromise({
		try: async () => {
			const jobOverviewTableList = await jobListPage
				.locator("table.kyujin.mt1.noborder")
				.all();
			if (jobOverviewTableList.length === 0)
				throw new ListJobsError({ message: "jobOverList is empty." });
			return jobOverviewTableList as JobOverViewList;
		},
		catch: (e) =>
			new ListJobsError({ message: `unexpected error.\n${String(e)}` }),
	});
}

export function extractJobNumbers(
	jobOverviewList: JobOverViewList,
): Effect.Effect<JobNumber[], ExtractJobNumbersError, never> {
	return Effect.tryPromise({
		try: () => {
			return Promise.all(
				jobOverviewList.map(async (table) => {
					const jobNumber = await table
						.locator("div.right-side")
						.locator("tr")
						.nth(3)
						.locator("td")
						.nth(1)
						.textContent();
					if (!jobNumber) {
						throw new ExtractJobNumbersError({ message: "jobNumber is null" });
					}
					return jobNumber.trim() as JobNumber;
				}),
			);
		},
		catch: (e) =>
			new ExtractJobNumbersError({ message: `unexpected error. ${String(e)}` }),
	});
}

export function isNextPageEnabled(page: JobListPage) {
	return Effect.tryPromise({
		try: async () => {
			const nextPageBtn = page.locator('input[value="次へ＞"]').first();
			return !(await nextPageBtn.isDisabled());
		},
		catch: (e) => {
			console.error(e);
			return new IsNextPageEnabledError({
				message: `unexpected error. ${String(e)}`,
			});
		},
	});
}

export function fetchJobMetaData({
	jobListPage,
	count,
	roughMaxCount,
}: {
	jobListPage: JobListPage;
	count: number;
	roughMaxCount: number;
}) {
	return Effect.gen(function* () {
		const jobOverviewList = yield* listJobOverviewElem(jobListPage);
		const jobNumbers = (yield* extractJobNumbers(jobOverviewList)).map(
			(jobNumber) => ({
				jobNumber,
			}),
		);
		const chunked = Chunk.fromIterable(jobNumbers);
		const nextPage = yield* goToNextJobListPage(jobListPage);
		const nextPageEnabled = yield* isNextPageEnabled(nextPage);
		yield* delay(crawlingConfig.nextPageDelayMs);
		const tmpTotal = count + jobNumbers.length;
		yield* Effect.logInfo(`${tmpTotal} crawling finished`);
		return [
			chunked,
			nextPageEnabled && tmpTotal <= roughMaxCount
				? Option.some({
						jobListPage: nextPage,
						count: tmpTotal,
						roughMaxCount,
					})
				: Option.none(),
		] as const;
	});
}

export function validateJobListPage(page: Page) {
	return Effect.tryPromise({
		try: async () => {
			const count = await page.locator(".kyujin").count();
			if (count === 0) {
				throw new ValidateJobListPageError({ message: "job list is empty" });
			}
			return page as JobListPage;
		},
		catch: (e) =>
			new ValidateJobListPageError({
				message: `unexpected error. ${String(e)}`,
			}),
	});
}

export function validateJobSearchPage(page: Page) {
	return Effect.tryPromise({
		try: async () => {
			const url = page.url();
			if (!url.includes("kensaku"))
				throw new ValidateJobSearchPageError({
					message: `not on job search page.\nurl=${url}`,
				});
			return page as HelloWorkSearchPage;
		},
		catch: (e) =>
			new ValidateJobSearchPageError({
				message: `unexpected error.\n${String(e)}`,
			}),
	});
}

export function engineeringLabelToSelector(
	label: EngineeringLabel,
): Effect.Effect<
	EngineeringLabelSelector,
	EngineeringLabelSelectorError,
	never
> {
	switch (label) {
		case "ソフトウェア開発技術者、プログラマー":
			return Effect.succeed({
				radioBtn: "#ID_skCheck094" as EngineeringLabelSelectorRadioBtn,
				openerSibling: "#ID_skHid09" as EngineeringLabelSelectorOpenerSibling,
			});
		default:
			return Effect.fail(
				new EngineeringLabelSelectorError({
					message: `Error: invalid label=${label}`,
				}),
			);
	}
}
