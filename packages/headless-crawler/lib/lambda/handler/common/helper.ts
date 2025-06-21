import { Effect } from "effect";
import type { Browser, Page } from "playwright";
import {
  EngineeringLabelSelectorError,
  GoToHelloWorkSearchPageError,
} from "../crawler/error";
import type { JobListPage } from "../crawler/type";
import {
  EmploymentLabelToSelectorError,
  FillOccupationFieldError,
  FillPrefectureFieldError,
  FillWorkTypeError,
  JobListPageValidationError,
  JobNumberValidationError,
  JobSearchPageValidationError,
  ListJobsError,
  NewPageError,
} from "./error";
import { jobNumber } from "./schema";
import type {
  DirtyWorkLocation,
  EmploymentType,
  EmploymentTypeSelector,
  EngineeringLabel,
  EngineeringLabelSelector,
  EngineeringLabelSelectorOpenerSibling,
  EngineeringLabelSelectorRadioBtn,
  HelloWorkSearchPage,
  JobNumber,
  JobOverViewList,
  JobSearchCriteria,
} from "./type";

export function createPage(browser: Browser) {
  return Effect.tryPromise({
    try: () => browser.newPage(),
    catch: (e) =>
      new NewPageError({ message: `unexpected error.\n${String(e)}` }),
  });
}

export function goToHelloWorkSearchThenReturnPage(page: Page) {
  return Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: async () => {
        await page.goto(
          "https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do?action=initDisp&screenId=GECA110010",
        );
      },
      catch: (e) =>
        new GoToHelloWorkSearchPageError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    const searchPage = yield* validateJobSearchPage(page);
    return searchPage;
  });
}

function validateJobSearchPage(page: Page) {
  return Effect.gen(function* () {
    const url = page.url();
    if (!url.includes("kensaku"))
      yield* Effect.fail(
        new JobSearchPageValidationError({
          message: `not on job search page.\nurl=${url}`,
        }),
      );
    const helloWorkSearchPage = yield* Effect.tryPromise({
      try: async () => {
        return page as HelloWorkSearchPage;
      },
      catch: (e) =>
        new JobSearchPageValidationError({
          message: `unexpected error.\n${String(e)}`,
        }),
    });
    return helloWorkSearchPage;
  });
}

export function validateJobNumber(val: unknown) {
  return Effect.try({
    try: () => jobNumber.parse(val) as JobNumber,
    catch: (e) =>
      new JobNumberValidationError({
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
function employmentLabelToSelector(employmentType: EmploymentType) {
  switch (employmentType) {
    case "PartTimeWorker":
      return Effect.succeed("#ID_ippanCKBox1" as EmploymentTypeSelector);
    case "RegularEmployee":
      return Effect.succeed("#ID_ippanCKBox2" as EmploymentTypeSelector);
    default:
      return Effect.fail(
        new EmploymentLabelToSelectorError({
          message: `unknown label: ${employmentType}`,
        }),
      );
  }
}
function fillWorkType(
  page: HelloWorkSearchPage,
  employmentType: EmploymentType,
) {
  return Effect.gen(function* () {
    const selector = yield* employmentLabelToSelector(employmentType);
    yield* Effect.tryPromise({
      try: async () => {
        await page.locator(selector).check();
      },
      catch: (e) =>
        new FillWorkTypeError({
          message: `Error: invalid employmentType: ${employmentType}`,
        }),
    });
  });
}

function fillPrefectureField(
  page: HelloWorkSearchPage,
  workLocation: DirtyWorkLocation,
) {
  const { prefecture } = workLocation;
  return Effect.gen(function* () {
    yield* Effect.logDebug(
      `fill PrefectureField.\nworkLocation: ${JSON.stringify(workLocation, null, 2)}`,
    );
    yield* Effect.tryPromise({
      try: async () => {
        const prefectureSelector = page.locator("#ID_tDFK1CmbBox");
        await prefectureSelector.selectOption(prefecture);
      },
      catch: (e) =>
        new FillPrefectureFieldError({
          message: `Error: workLocation=${workLocation} ${String(e)}`,
        }),
    });
  });
}

function fillOccupationField(
  page: HelloWorkSearchPage,
  label: EngineeringLabel,
) {
  return Effect.gen(function* () {
    const selector = yield* engineeringLabelToSelector(label);
    yield* Effect.logDebug(
      `will execute fillOccupationField\nlabel=${label}\nselector=${JSON.stringify(selector, null, 2)}`,
    );
    yield* Effect.tryPromise({
      try: async () => {
        const firstoccupationSelectionBtn = page
          .locator("#ID_Btn", { hasText: /職種を選択/ })
          .first();
        await firstoccupationSelectionBtn.click();
        const openerSibling = page.locator(selector.openerSibling);
        const opener = openerSibling.locator("..").locator("i.one_i");
        await opener.click();
        const radioBtn = page.locator(selector.radioBtn);
        await radioBtn.click();
        const okBtn = page.locator("#ID_ok3");
        await okBtn.click();
      },
      catch: (e) =>
        new FillOccupationFieldError({
          message: `unexpected Error. label=${label}\n${String(e)}`,
        }),
    });
  });
}

export function fillJobCriteriaField(
  page: HelloWorkSearchPage,
  jobSearchCriteria: JobSearchCriteria,
) {
  const { employmentType, workLocation, desiredOccupation } = jobSearchCriteria;
  return Effect.gen(function* () {
    if (employmentType) yield* fillWorkType(page, employmentType);
    if (workLocation) yield* fillPrefectureField(page, workLocation);
    if (desiredOccupation?.occupationSelection) {
      yield* fillOccupationField(page, desiredOccupation.occupationSelection);
    }
  });
}

export function engineeringLabelToSelector(
  label: EngineeringLabel,
): Effect.Effect<
  EngineeringLabelSelector,
  EngineeringLabelSelectorError,
  never
> {
  switch (label) {
    case "ソフトウェア開発技術者、プログラマー":
      return Effect.succeed({
        radioBtn: "#ID_skCheck094" as EngineeringLabelSelectorRadioBtn,
        openerSibling: "#ID_skHid09" as EngineeringLabelSelectorOpenerSibling,
      });
    default:
      return Effect.fail(
        new EngineeringLabelSelectorError({
          message: `Error: invalid label=${label}`,
        }),
      );
  }
}

export function listJobOverviewElem(
  jobListPage: JobListPage,
): Effect.Effect<JobOverViewList, ListJobsError, never> {
  return Effect.tryPromise({
    try: () => jobListPage.locator("table.kyujin.mt1.noborder").all(),
    catch: (e) =>
      new ListJobsError({ message: `unexpected error.\n${String(e)}` }),
  }).pipe(
    Effect.flatMap((tables) =>
      tables.length === 0
        ? Effect.fail(new ListJobsError({ message: "jobOverList is empty." }))
        : Effect.succeed(tables as JobOverViewList),
    ),
  );
}
