import { Effect } from "effect";
import type { Page } from "playwright";
import { GoToJobSearchPageError } from "../error";

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
