import { Effect } from "effect";
import {
	FillOccupationFieldError,
	FillPrefectureFieldError,
	FillWorkTypeError,
} from "../../error";
import type {
	DirtyWorkLocation,
	EmploymentType,
	EngineeringLabel,
	HelloWorkSearchPage,
	JobSearchCriteria,
} from "../../type";
import { engineeringLabelToSelector } from "./util";

function fillWorkType(
	page: HelloWorkSearchPage,
	employmentType: EmploymentType,
) {
	return Effect.tryPromise({
		try: async () => {
			switch (employmentType) {
				case "RegularEmployee":
					await page.locator("#ID_ippanCKBox1").check();
					break;
				case "PartTimeWorker":
					await page.locator("#ID_ippanCKBox2").check();
					break;
				default:
					throw new FillWorkTypeError({
						message: `Error: invalid employmentType: ${employmentType}`,
					});
			}
		},
		catch: () =>
			new FillWorkTypeError({
				message: `Error: invalid employmentType: ${employmentType}`,
			}),
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
