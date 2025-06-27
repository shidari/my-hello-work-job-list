import { employeeCountSchema, homePage, receivedDate } from "@sho/schema";
import { Effect } from "effect";
import type { Page } from "playwright";
import {
  EmployeeCountValidationError,
  ExpiryDateValidationError,
  HomePageValidationError,
  JobDetailPageValidationError,
  ReceivedDateValidationError,
} from "./scraper-error";
import type {
  EmployeetCount,
  ExpiryDate,
  HomePage,
  JobDetailPage,
  ReceivedDate,
} from "./scraper-type";

export function validateReceivedDate(val: unknown) {
  return Effect.try({
    try: () => receivedDate.parse(val) as ReceivedDate,
    catch: (e) =>
      new ReceivedDateValidationError({
        message: `unexpected error.\n${String(e)}`,
      }),
  });
}
export function validateExpiryDate(val: unknown) {
  return Effect.try({
    try: () => receivedDate.parse(val) as ExpiryDate,
    catch: (e) =>
      new ExpiryDateValidationError({
        message: `unexpected error.\n${String(e)}`,
      }),
  });
}

export function validateHomePage(val: unknown) {
  return Effect.try({
    try: () => homePage.parse(val) as HomePage,
    catch: (e) =>
      new HomePageValidationError({
        message: `unexpected error.\n${String(e)}`,
      }),
  });
}

// いい書き方が分からなくてちょっと複雑になっている
export function validateEmpoyeeCount(val: unknown) {
  return Effect.try({
    try: () => {
      const result = employeeCountSchema.safeParse(val);
      if (!result.success) {
        throw new EmployeeCountValidationError({
          message: result.error.issues.map((i) => i.message).join("; "),
        });
      }
      return result.data as EmployeetCount;
    },
    catch: (e) =>
      e instanceof EmployeeCountValidationError
        ? new EmployeeCountValidationError({
            message: e.message,
          })
        : new EmployeeCountValidationError({
            message: `Unexpected error.\n${String(e)}`,
          }),
  });
}

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
