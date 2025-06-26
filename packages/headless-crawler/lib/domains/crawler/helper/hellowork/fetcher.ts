import { Chunk, Effect, Option } from "effect";
import { listJobOverviewElem } from "../../../shared/helper/helper";
import type { JobListPage } from "../../../shared/type";
import { delay } from "../../../shared/util";
import { extractJobNumbers } from "./extractor";
import { goToNextJobListPage, isNextPageEnabled } from "./pagenation";

export function fetchJobMetaData({
  jobListPage,
  count,
  roughMaxCount,
  nextPageDelayMs,
}: {
  jobListPage: JobListPage;
  count: number;
  roughMaxCount: number;
  nextPageDelayMs: number;
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
    yield* delay(nextPageDelayMs);
    const tmpTotal = count + jobNumbers.length;
    yield* Effect.logInfo(`${tmpTotal} crawling finished`);
    return [
      chunked,
      nextPageEnabled && tmpTotal <= roughMaxCount
        ? Option.some({
            jobListPage: nextPage,
            count: tmpTotal,
            roughMaxCount,
            nextPageDelayMs, // 後で構造修正する予定
          })
        : Option.none(),
    ] as const;
  });
}
