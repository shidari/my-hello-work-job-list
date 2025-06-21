import { Effect } from "effect";
import { validateJobNumber } from "../common/helper";
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
} from "./error";
import type {
  ExtractTextContentError,
  JobDetailPage,
  JobDetailPageContentValidationError,
  JobInfo,
} from "./type";
import {
  validateEmpoyeeCount,
  validateExpiryDate,
  validateHomePage,
  validateReceivedDate,
} from "./validator";

function extractJobNumber(page: JobDetailPage) {
  return Effect.gen(function* () {
    const jobNumberLoc = page.locator("#ID_kjNo");
    const rawJobNumber = yield* Effect.tryPromise({
      try: async () => {
        const rawJobNumber = await jobNumberLoc.textContent();
        if (rawJobNumber === null)
          throw new ExtractJobInfoError({ message: "jobNumber is null." });
        return rawJobNumber;
      },
      catch: (e) =>
        new ExtractJobInfoError({ message: `unexpected error.\n${String(e)}` }),
    });
    const jobNumber = yield* validateJobNumber(rawJobNumber);
    return jobNumber;
  });
}
function extractCompanyName(page: JobDetailPage) {
  return Effect.tryPromise({
    try: async () => {
      const companyNameLoc = page.locator("#ID_jgshMei");
      const companyName = await companyNameLoc.textContent();
      if (companyName === null)
        throw new ExtractJobCompanyNameError({ message: "jobNumber is null." });
      return companyName;
    },
    catch: (e) =>
      new ExtractJobCompanyNameError({
        message: `unexpected error.\n${String(e)}`,
      }),
  });
}
function extractReceivedDate(page: JobDetailPage) {
  return Effect.gen(function* () {
    const receivedDateLoc = page.locator("#ID_uktkYmd");
    const rawReceivedDate = yield* Effect.tryPromise({
      try: async () => {
        const text = await receivedDateLoc.textContent();
        if (!text)
          throw new ExtractReceivedDateError({
            message: "received date textContent is null",
          });
        return text;
      },
      catch: (e) =>
        new ExtractReceivedDateError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
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
        if (!text)
          throw new ExtractExpiryDateError({
            message: "expiryDate textContent is null.",
          });
        return text;
      },
      catch: (e) =>
        new ExtractExpiryDateError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
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
        if (!text) new ExtractHomePageError({ message: "home page is null" });
        return text;
      },
      catch: (e) =>
        new ExtractHomePageError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    const homePage = yield* validateHomePage(rawHomePage?.trim());
    return homePage;
  });
}
function extractOccupation(page: JobDetailPage) {
  return Effect.tryPromise({
    try: async () => {
      const occupationLoc = page.locator("#ID_sksu");
      const text = await occupationLoc.textContent();
      if (!text)
        throw new ExtractOccupationError({ message: "occupation is empty." });
      return text;
    },
    catch: (e) =>
      new ExtractOccupationError({
        message: `unexpected error.\n${String(e)}`,
      }),
  });
}
function extractEmploymentType(page: JobDetailPage) {
  return Effect.tryPromise({
    try: async () => {
      const employmentTypeLoc = page.locator("#ID_koyoKeitai");

      const text = await employmentTypeLoc.textContent();
      if (!text)
        throw new ExtractEmployMentTypeError({
          message: "emploment type is empty.",
        });
      return text;
    },
    catch: (e) =>
      new ExtractEmployMentTypeError({
        message: `unexpected error.\n${String(e)}`,
      }),
  });
}
function extractWage(page: JobDetailPage) {
  return Effect.tryPromise({
    try: async () => {
      const wageLoc = page.locator("#ID_chgn");
      const text = await wageLoc.textContent();
      if (!text) throw new ExtractWageError({ message: "wage is empty" });
      return text;
    },
    catch: (e) =>
      new ExtractWageError({ message: `unexpected error.\n${String(e)}` }),
  });
}
function extractWorkingHours(page: JobDetailPage) {
  return Effect.tryPromise({
    try: async () => {
      // 一旦一つだけ
      const workingHoursLoc = page.locator("#ID_shgJn1");
      const text = await workingHoursLoc.textContent();
      if (!text)
        throw new ExtractWorkingHoursError({
          message: "working hours is empty",
        });
      return text;
    },
    catch: (e) =>
      new ExtractWorkingHoursError({
        message: `unexpected error.\n${String(e)}`,
      }),
  });
}

function extractEmployeeCount(page: JobDetailPage) {
  const employeeCountLoc = page.locator("#ID_jgisKigyoZentai");
  return Effect.gen(function* () {
    const rawEmployeeCount = yield* Effect.tryPromise({
      try: async () => {
        const text = await employeeCountLoc.textContent();
        if (!text)
          throw new ExtractEmployeeCountError({
            message: "employee count is empty",
          });
        return text;
      },
      catch: (e) =>
        new ExtractEmployeeCountError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    yield* Effect.logDebug(`rawEmployeeCount=${rawEmployeeCount}`);
    const employeeCount = yield* validateEmpoyeeCount(rawEmployeeCount);
    return employeeCount;
  });
}

export function extractJobInfo(
  page: JobDetailPage,
): Effect.Effect<
  JobInfo,
  ExtractTextContentError | JobDetailPageContentValidationError
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
