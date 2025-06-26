import { Effect } from "effect";
import type { Page } from "playwright";
import {
  JobListPageValidationError,
  JobNumberValidationError,
  JobSearchPageValidationError,
} from "../error";
import { jobNumber } from "../schema";
import type { JobListPage, JobNumber, JobSearchPage } from "../type";

export function validateJobSearchPage(page: Page) {
  return Effect.gen(function* () {
    const url = page.url();
    if (!url.includes("kensaku"))
      yield* Effect.fail(
        new JobSearchPageValidationError({
          message: `not on job search page.\nurl=${url}`,
        }),
      );
    const jobSearchPage = yield* Effect.tryPromise({
      try: async () => {
        return page as JobSearchPage;
      },
      catch: (e) =>
        new JobSearchPageValidationError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    return jobSearchPage;
  });
}

export function validateJobNumber(val: unknown) {
  return Effect.gen(function* () {
    yield* Effect.logDebug(
      `calling validateJobNumber. args={val:${JSON.stringify(val, null, 2)}}`,
    );
    return yield* Effect.try({
      try: () => jobNumber.parse(val) as JobNumber,
      catch: (e) =>
        new JobNumberValidationError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
  });
}

export function validateJobListPage(page: Page) {
  return Effect.tryPromise({
    try: async () => {
      return page.locator(".kyujin").count();
    },
    catch: (e) =>
      new JobListPageValidationError({
        message: `unexpected error. ${String(e)}`,
      }),
  }).pipe(
    Effect.flatMap((pageCount) =>
      pageCount === 0
        ? Effect.fail(
            new JobListPageValidationError({ message: "job list is empty" }),
          )
        : Effect.succeed(page as JobListPage),
    ),
  );
}
