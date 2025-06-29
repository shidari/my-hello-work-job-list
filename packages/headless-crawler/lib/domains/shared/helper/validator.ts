import {
  CompanyNameSchema,
  EmployeeCountSchema,
  EmploymentTypeSchema,
  ExpiryDateSchema,
  HomePageSchema,
  type JobListPage,
  JobNumberSchema,
  type JobSearchPage,
  OccupationSchema,
  ReceivedDateShema,
  WageSchema,
  WorkingHoursSchema,
} from "@sho/schema";
import { Effect } from "effect";
import type { Page } from "playwright";
import { ZodError } from "zod/v4";
import {
  CompanyNameValidationError,
  EmployeeCountValidationError,
  EmploymentTypeValidationError,
  ExpiryDateValidationError,
  HomePageValidationError,
  JobListPageValidationError,
  JobNumberValidationError,
  JobSearchPageValidationError,
  OccupationValidationError,
  ReceivedDateValidationError,
  WageValidationError,
  WorkingHoursValidationError,
} from "../error";

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
      try: () => JobNumberSchema.parse(val),
      catch: (e) =>
        e instanceof ZodError
          ? new JobNumberValidationError({
              message: e.message,
            })
          : new JobNumberValidationError({
              message: `unexpected error.\n${String(e)}`,
            }),
    });
  });
}

export function validateCompanyName(val: unknown) {
  return Effect.try({
    try: () => CompanyNameSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new CompanyNameValidationError({ message: e.message })
        : new CompanyNameValidationError({
            message: `unexpected error.\n${String(e)}`,
          }),
  });
}

export function validateReceivedDate(val: unknown) {
  return Effect.try({
    try: () => ReceivedDateShema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new ReceivedDateValidationError({ message: e.message })
        : new ReceivedDateValidationError({
            message: `unexpected error.\n${String(e)}`,
          }),
  });
}
export function validateExpiryDate(val: unknown) {
  return Effect.try({
    try: () => ExpiryDateSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new ExpiryDateValidationError({ message: e.message })
        : new ExpiryDateValidationError({
            message: `unexpected error.\n${String(e)}`,
          }),
  });
}
export function validateHomePage(val: unknown) {
  return Effect.try({
    try: () => HomePageSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new HomePageValidationError({ message: e.message })
        : new HomePageValidationError({
            message: `unexpected error.\n${String(e)}`,
          }),
  });
}

export function validateOccupation(val: unknown) {
  return Effect.gen(function* () {
    yield* Effect.logDebug(
      `validateOccupation. args=${JSON.stringify(val, null, 2)}`,
    );
    return yield* Effect.try({
      try: () => OccupationSchema.parse(val),
      catch: (e) =>
        e instanceof ZodError
          ? new OccupationValidationError({ message: e.message })
          : new OccupationValidationError({
              message: `unexpected error.\n${String(e)}`,
            }),
    });
  });
}

export function validateEmploymentType(val: unknown) {
  return Effect.try({
    try: () => EmploymentTypeSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new EmploymentTypeValidationError({ message: e.message })
        : new EmploymentTypeValidationError({
            message: `unexpected error.\n${String(e)}`,
          }),
  });
}

export function validateWage(val: unknown) {
  return Effect.try({
    try: () => WageSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new WageValidationError({ message: e.message })
        : new WageValidationError({
            message: `unexpected error.\n${String(e)}`,
          }),
  });
}

export function validateWorkingHours(val: unknown) {
  return Effect.try({
    try: () => WorkingHoursSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new WorkingHoursValidationError({ message: e.message })
        : new WorkingHoursValidationError({
            message: `unexpected error.\n${String(e)}`,
          }),
  });
}
export function validateEmployeeCount(val: unknown) {
  return Effect.try({
    try: () => EmployeeCountSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new EmployeeCountValidationError({ message: e.message })
        : new EmployeeCountValidationError({
            message: `unexpected error.\n${String(e)}`,
          }),
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
