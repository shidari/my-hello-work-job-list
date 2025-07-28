import type {
  DirtyWorkLocation,
  EmploymentType,
  EmploymentTypeSelector,
  EngineeringLabel,
  JobSearchCriteria,
  JobSearchPage,
} from "@sho/models";
import { Effect } from "effect";
import {
  EmploymentLabelToSelectorError,
  FillOccupationFieldError,
  FillPrefectureFieldError,
  FillWorkTypeError,
} from "../error";
import { engineeringLabelToSelector } from "./helper";

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
function fillWorkType(page: JobSearchPage, employmentType: EmploymentType) {
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
  page: JobSearchPage,
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

function fillOccupationField(page: JobSearchPage, label: EngineeringLabel) {
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
  page: JobSearchPage,
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
