import {
  BrandedCompanyNameSchema,
  BrandedEmploymentTypeSchema,
  BrandedHomePageSchema,
  BrandedJobDescriptionSchema,
  BrandedJobNumberSchema,
  BrandedOccupationSchema,
  BrandedParsedEmploymentCountSchema,
  BrandedParsedExpiryDateSchema,
  BrandedParsedReceivedDateSchema,
  BrandedParsedWorkingHoursSchema,
  BrandedQualificationsSchema,
  BrandedWageSchema,
  BrandedWorkPlaceSchema,
  type JobListPage,
  type JobSearchPage,
  RawEmployeeCountSchema,
  RawExpiryDateSchema,
  RawReceivedDateShema,
  RawWageSchema,
  RawWorkingHoursSchema,
  insertJobSuccessResponseSchema,
} from "@sho/schema";
import { Effect } from "effect";
import type { Page } from "playwright";
import type z from "zod";
import { ZodError } from "zod/v4";
import {
  CompanyNameValidationError,
  EmployeeCountValidationError,
  EmploymentTypeValidationError,
  ExpiryDateValidationError,
  HomePageValidationError,
  InsertJobSuccessResponseValidationError,
  JobDescriptionValidationError,
  JobListPageValidationError,
  JobNumberValidationError,
  JobSearchPageValidationError,
  OccupationValidationError,
  QualificationValidationError,
  ReceivedDateValidationError,
  WageValidationError,
  WorkPlaceValidationError,
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
      try: () => BrandedJobNumberSchema.parse(val),
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
    try: () => BrandedCompanyNameSchema.parse(val),
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
    try: () => BrandedParsedReceivedDateSchema.parse(val),
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
    try: () => BrandedParsedExpiryDateSchema.parse(val),
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
    try: () => BrandedHomePageSchema.parse(val),
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
      `calling validateOccupation. args=${JSON.stringify(val, null, 2)}`,
    );
    return yield* Effect.try({
      try: () => BrandedOccupationSchema.parse(val),
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
    try: () => BrandedEmploymentTypeSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new EmploymentTypeValidationError({ message: e.message })
        : new EmploymentTypeValidationError({
            message: `unexpected error.\n${String(e)}`,
          }),
  });
}

export function validateWage(val: unknown) {
  return Effect.gen(function* () {
    yield* Effect.logDebug(
      `calling validateWage. args=${JSON.stringify(val, null, 2)}`,
    );
    return yield* Effect.try({
      try: () => BrandedWageSchema.parse(val),
      catch: (e) =>
        e instanceof ZodError
          ? new WageValidationError({ message: e.message })
          : new WageValidationError({
              message: `unexpected error.\n${String(e)}`,
            }),
    });
  });
}

export function validateWorkingHours(val: unknown) {
  return Effect.try({
    try: () => BrandedParsedWorkingHoursSchema.parse(val),
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
    try: () => BrandedParsedEmploymentCountSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new EmployeeCountValidationError({ message: e.message })
        : new EmployeeCountValidationError({
            message: `unexpected error.\n${String(e)}`,
          }),
  });
}

export function validateWorkPlace(val: unknown) {
  return Effect.try({
    try: () => BrandedWorkPlaceSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new WorkPlaceValidationError({ message: e.message })
        : new WorkPlaceValidationError({
            message: `unexpected error. \n${String(e)}`,
          }),
  });
}

export function validateJobDescription(val: unknown) {
  return Effect.try({
    try: () => BrandedJobDescriptionSchema.parse(val),
    catch: (e) =>
      e instanceof ZodError
        ? new JobDescriptionValidationError({ message: e.message })
        : new JobDescriptionValidationError({
            message: `unexpected error.\n${String}`,
          }),
  });
}

export function validateQualification(
  val: unknown,
): Effect.Effect<
  z.infer<typeof BrandedQualificationsSchema>,
  QualificationValidationError
> {
  const result = BrandedQualificationsSchema.safeParse(val);
  if (result.error) {
    return Effect.fail(
      new QualificationValidationError({ message: result.error.message }),
    );
  }
  return Effect.succeed(result.data);
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

export function validateInsertJobSuccessResponse(val: unknown) {
  return Effect.try({
    try: () => {
      insertJobSuccessResponseSchema.parse(val);
    },
    catch: (e) =>
      new InsertJobSuccessResponseValidationError({
        message: `validate inserted job success response error.\n${String(e)}`,
      }),
  });
}
