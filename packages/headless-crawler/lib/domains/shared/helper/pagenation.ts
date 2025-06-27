import { Effect } from "effect";
import type { Page } from "playwright";
import { SearchThenGotoFirstJobListPageError } from "../../crawler/crawler-error";
import { GoToJobSearchPageError } from "../error";
import type { JobSearchCriteria, JobSearchPage } from "../type";
import { fillJobCriteriaField } from "./form";

export function goToJobSearchPage(page: Page) {
  return Effect.tryPromise({
    try: async () => {
      await page.goto(
        "https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do?action=initDisp&screenId=GECA110010",
      );
    },
    catch: (e) =>
      new GoToJobSearchPageError({
        message: `unexpected error.\n${String(e)}`,
      }),
  });
}

export function searchThenGotoJobListPage(
  page: JobSearchPage,
  searchFilter: JobSearchCriteria,
) {
  return Effect.gen(function* () {
    yield* fillJobCriteriaField(page, searchFilter);
    yield* Effect.tryPromise({
      try: async () => {
        const searchBtn = page.locator("#ID_searchBtn");
        await Promise.all([
          page.waitForURL("**/kensaku/*.do"),
          searchBtn.click(),
        ]);
      },
      catch: (e) =>
        new SearchThenGotoFirstJobListPageError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
  });
}
