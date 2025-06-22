import { Effect } from "effect";
import { validateJobListPage } from "../shared/helper/validator";
import type { JobListPage, JobNumber, JobSearchPage } from "../shared/type";
import { assertSingleJobListed } from "./aserter";
import {
  FromJobListToJobDetailPageError,
  SearchThenGotoJobListPageError,
} from "./error";
import { fillJobNumber } from "./form";

export function searchThenGotoJobListThenReturnPage(
  page: JobSearchPage,
  jobNumber: JobNumber,
) {
  return Effect.gen(function* () {
    yield* Effect.logDebug("in searchThenGotoJobListPage");
    yield* fillJobNumber(page, jobNumber);
    yield* Effect.logDebug(
      "in searchThenGotoJobListPage. fillJobNumber executed.",
    );
    yield* Effect.tryPromise({
      try: async () => {
        const numberSearchBtn = page.locator("#ID_searchNoBtn");
        await numberSearchBtn.click();
      },
      catch: (e) =>
        new SearchThenGotoJobListPageError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    const jobListPage = yield* validateJobListPage(page);
    return jobListPage;
  });
}

export function goToSingleJobDetailPage(page: JobListPage) {
  return Effect.gen(function* () {
    // 求人一覧ページに飛ぶが、番号検索なので1件のみ一致なはず、それを一旦チェックする
    yield* assertSingleJobListed(page);
    const dirtyDetailPage = yield* Effect.tryPromise({
      try: async () => {
        // 一件しかないことをアサートしてるので
        const showDetailBtn = page.locator("#ID_dispDetailBtn").first();
        // 新しいタブを開かないようにtarget属性を消す
        showDetailBtn.evaluate((elm) => elm.removeAttribute("target"));
        await showDetailBtn.click();
      },
      catch: (e) =>
        new FromJobListToJobDetailPageError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
  });
}
