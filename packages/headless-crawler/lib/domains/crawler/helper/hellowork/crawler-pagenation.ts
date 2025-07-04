import { Effect } from "effect";

import type { JobListPage } from "@sho/schema";
import {
  IsNextPageEnabledError,
  NextJobListPageError,
} from "../../crawler-error";

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
