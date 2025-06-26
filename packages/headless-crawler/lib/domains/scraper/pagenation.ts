import { Effect } from "effect";
import type { JobListPage } from "../shared/type";
import { assertSingleJobListed } from "./aserter";
import { FromJobListToJobDetailPageError } from "./error";

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
