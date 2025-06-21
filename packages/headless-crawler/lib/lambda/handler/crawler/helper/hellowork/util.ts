import { Chunk, Effect, Option } from "effect";
import { ExtractJobNumbersError } from "../../../common/error";
import { listJobOverviewElem, validateJobNumber } from "../../../common/helper";
import type { JobOverViewList } from "../../../common/type";
import crawlingConfig from "../../crawling.config";
import { IsNextPageEnabledError } from "../../error";
import type { JobListPage } from "../../type";
import { delay } from "../util";
import { goToNextJobListPage } from "./pagenation";

export function extractJobNumbers(jobOverviewList: JobOverViewList) {
  return Effect.forEach(jobOverviewList, (table) => {
    return Effect.gen(function* () {
      const rawJobNumber = yield* Effect.tryPromise({
        try: () => {
          return Promise.all(
            jobOverviewList.map(async (table) => {
              const text = await table
                .locator("div.right-side")
                .locator("tr")
                .nth(3)
                .locator("td")
                .nth(1)
                .textContent();
              if (!text) {
                return Effect.fail(
                  new ExtractJobNumbersError({ message: "jobNumber is null" }),
                );
              }
              return text;
            }),
          );
        },
        catch: (e) =>
          new ExtractJobNumbersError({
            message: `unexpected error. ${String(e)}`,
          }),
      });
      const jobNumber = yield* validateJobNumber(rawJobNumber);
      return jobNumber;
    });
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
