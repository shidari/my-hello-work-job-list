import { Effect } from "effect";
import { validateJobNumber } from "../shared/helper/validator";
import {
  ExtractEmployMentTypeError,
  ExtractEmployeeCountError,
  ExtractExpiryDateError,
  ExtractHomePageError,
  ExtractJobCompanyNameError,
  ExtractJobInfoError,
  ExtractOccupationError,
  ExtractReceivedDateError,
  ExtractWageError,
  ExtractWorkingHoursError,
} from "./scraper-error";
import type {
  ExtractTextContentOnScrapingError,
  JobDetailPage,
  JobDetailPageContentValidationError,
  JobInfo,
} from "./scraper-type";
import {
  validateEmpoyeeCount,
  validateExpiryDate,
  validateHomePage,
  validateReceivedDate,
} from "./scraper-validator";

function extractJobNumber(page: JobDetailPage) {
  return Effect.gen(function* () {
    const jobNumberLoc = page.locator("#ID_kjNo");
    const rawJobNumber = yield* Effect.tryPromise({
      try: async () => {
        const rawJobNumber = await jobNumberLoc.textContent();
        return rawJobNumber;
      },
      catch: (e) =>
        new ExtractJobInfoError({ message: `unexpected error.\n${String(e)}` }),
    });
    if (rawJobNumber === null)
      return yield* Effect.fail(
        new ExtractJobInfoError({ message: "jobNumber is null." }),
      );
    const jobNumber = yield* validateJobNumber(rawJobNumber);
    return jobNumber;
  });
}
function extractCompanyName(page: JobDetailPage) {
  return Effect.gen(function* () {
    const companyName = yield* Effect.tryPromise({
      try: async () => {
        const companyNameLoc = page.locator("#ID_jgshMei");
        const text = await companyNameLoc.textContent();
        return text;
      },
      catch: (e) =>
        new ExtractJobCompanyNameError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    if (companyName === null)
      return yield* Effect.fail(
        new ExtractJobCompanyNameError({ message: "jobNumber is null." }),
      );
    return companyName;
  });
}
function extractReceivedDate(page: JobDetailPage) {
  return Effect.gen(function* () {
    const receivedDateLoc = page.locator("#ID_uktkYmd");
    const rawReceivedDate = yield* Effect.tryPromise({
      try: async () => {
        const text = await receivedDateLoc.textContent();
        return text;
      },
      catch: (e) =>
        new ExtractReceivedDateError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    if (!rawReceivedDate)
      return yield* Effect.fail(
        new ExtractReceivedDateError({
          message: "received date textContent is null",
        }),
      );
    yield* Effect.logDebug(`rawReceivedDate=${rawReceivedDate}`);
    const receivedDate = yield* validateReceivedDate(rawReceivedDate);
    return receivedDate;
  });
}
function extractExpiryDate(page: JobDetailPage) {
  return Effect.gen(function* () {
    const expiryDateLoc = page.locator("#ID_shkiKigenHi");
    const rawExpiryDate = yield* Effect.tryPromise({
      try: async () => {
        const text = await expiryDateLoc.textContent();
        return text;
      },
      catch: (e) =>
        new ExtractExpiryDateError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    if (!rawExpiryDate)
      return yield* Effect.fail(
        new ExtractExpiryDateError({
          message: "expiryDate textContent is null.",
        }),
      );
    const expiryDate = yield* validateExpiryDate(rawExpiryDate);
    return expiryDate;
  });
}
function extractHomePage(page: JobDetailPage) {
  return Effect.gen(function* () {
    const homePageLoc = page.locator("#ID_hp");
    const rawHomePage = yield* Effect.tryPromise({
      try: async () => {
        const text = await homePageLoc.textContent();
        return text;
      },
      catch: (e) =>
        new ExtractHomePageError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    if (!rawHomePage)
      return yield* new ExtractHomePageError({ message: "home page is null" });

    const homePage = yield* validateHomePage(rawHomePage?.trim());
    return homePage;
  });
}
function extractOccupation(page: JobDetailPage) {
  return Effect.gen(function* () {
    const occupation = yield* Effect.tryPromise({
      try: async () => {
        const occupationLoc = page.locator("#ID_sksu");
        const text = await occupationLoc.textContent();
        return text;
      },
      catch: (e) =>
        new ExtractOccupationError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    if (!occupation)
      return yield* Effect.fail(
        new ExtractOccupationError({ message: "occupation is empty." }),
      );
    return occupation;
  });
}
function extractEmploymentType(page: JobDetailPage) {
  return Effect.gen(function* () {
    const emplomentType = yield* Effect.tryPromise({
      try: async () => {
        const employmentTypeLoc = page.locator("#ID_koyoKeitai");

        const text = await employmentTypeLoc.textContent();
        return text;
      },
      catch: (e) =>
        new ExtractEmployMentTypeError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    if (!emplomentType)
      return yield* Effect.fail(
        new ExtractEmployMentTypeError({
          message: "emploment type is empty.",
        }),
      );
    return emplomentType;
  });
}
function extractWage(page: JobDetailPage) {
  return Effect.gen(function* () {
    const wage = yield* Effect.tryPromise({
      try: async () => {
        const wageLoc = page.locator("#ID_chgn");
        const text = await wageLoc.textContent();
        return text;
      },
      catch: (e) =>
        new ExtractWageError({ message: `unexpected error.\n${String(e)}` }),
    });
    if (!wage)
      return yield* Effect.fail(
        new ExtractWageError({ message: "wage is empty" }),
      );
    return wage;
  });
}
function extractWorkingHours(page: JobDetailPage) {
  return Effect.gen(function* () {
    const workingHours = yield* Effect.tryPromise({
      try: async () => {
        // 一旦一つだけ
        const workingHoursLoc = page.locator("#ID_shgJn1");
        const text = await workingHoursLoc.textContent();
        return text;
      },
      catch: (e) =>
        new ExtractWorkingHoursError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    if (!workingHours)
      return yield* Effect.fail(
        new ExtractWorkingHoursError({
          message: "working hours is empty",
        }),
      );
    return workingHours;
  });
}

function extractEmployeeCount(page: JobDetailPage) {
  const employeeCountLoc = page.locator("#ID_jgisKigyoZentai");
  return Effect.gen(function* () {
    const rawEmployeeCount = yield* Effect.tryPromise({
      try: async () => {
        const text = await employeeCountLoc.textContent();
        return text;
      },
      catch: (e) =>
        new ExtractEmployeeCountError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    if (!rawEmployeeCount)
      return yield* Effect.fail(
        new ExtractEmployeeCountError({
          message: "employee count is empty",
        }),
      );
    yield* Effect.logDebug(`rawEmployeeCount=${rawEmployeeCount}`);
    const employeeCount = yield* validateEmpoyeeCount(rawEmployeeCount);
    return employeeCount;
  });
}

export function extractJobInfo(
  page: JobDetailPage,
): Effect.Effect<
  JobInfo,
  ExtractTextContentOnScrapingError | JobDetailPageContentValidationError
> {
  return Effect.gen(function* () {
    const jobNumber = yield* extractJobNumber(page);
    const companyName = yield* extractCompanyName(page);
    const receivedDate = yield* extractReceivedDate(page);
    const expiryDate = yield* extractExpiryDate(page);
    const homePage = yield* extractHomePage(page);
    const occupation = yield* extractOccupation(page);
    const employmentType = yield* extractEmploymentType(page);
    const wage = yield* extractWage(page);
    const workingHours = yield* extractWorkingHours(page);
    const employeeCount = yield* extractEmployeeCount(page);
    return {
      jobNumber,
      companyName,
      receivedDate,
      expiryDate,
      homePage,
      occupation,
      employmentType,
      wage,
      workingHours,
      employeeCount,
    };
  });
}
