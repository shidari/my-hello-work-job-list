import type { JobDetailPage } from "@sho/schema";
import { Effect } from "effect";
import type { Page } from "playwright";
import { JobDetailPageValidationError } from "./scraper-error";
export function validateJobDetailPage(
  page: Page,
): Effect.Effect<JobDetailPage, JobDetailPageValidationError, never> {
  return Effect.gen(function* () {
    const jobTitle = yield* Effect.tryPromise({
      try: async () => {
        const jobTitle = await page.locator("div.page_title").textContent();
        return jobTitle;
      },
      catch: (e) =>
        new JobDetailPageValidationError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    if (jobTitle !== "求人情報")
      throw new JobDetailPageValidationError({
        message: `textContent of div.page_title should be 求人情報 but got: "${jobTitle}"`,
      });
    return page as JobDetailPage;
  });
}
