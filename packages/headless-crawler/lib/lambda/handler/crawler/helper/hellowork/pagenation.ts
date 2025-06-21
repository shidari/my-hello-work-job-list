import { Effect } from "effect";
import type { Page } from "playwright";
import { fillJobCriteriaField } from "../../../common/helper";
import type {
  HelloWorkSearchPage,
  JobSearchCriteria,
} from "../../../common/type";
import {
  GoToHelloWorkSearchPageError,
  NextJobListPageError,
  SearchThenGotoFirstJobListPageError,
} from "../../error";
import type { FirstJobListPage, JobListPage } from "../../type";

export function goToNextJobListPage(page: JobListPage) {
  return Effect.tryPromise({
    try: async () => {
      const nextButton = page.locator('input[value="次へ＞"]').first();
      await nextButton.click();
      return page;
    },
    catch: (e) =>
      new NextJobListPageError({ message: `unexpected error.\n${String(e)}` }),
  });
}

export function searchThenGotoJobListPage(
  page: HelloWorkSearchPage,
  searchFilter: JobSearchCriteria,
) {
  return Effect.gen(function* () {
    yield* fillJobCriteriaField(page, searchFilter);
    yield* Effect.tryPromise({
      try: async () => {
        const searchBtn = page.locator("#ID_searchBtn");
        await searchBtn.click();
        // 型を一旦剥がして、別の方にするため
        const pagePrime: Page = page;
        return pagePrime as FirstJobListPage;
      },
      catch: (e) =>
        new SearchThenGotoFirstJobListPageError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
  });
}
