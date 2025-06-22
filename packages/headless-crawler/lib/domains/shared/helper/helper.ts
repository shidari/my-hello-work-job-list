import { Effect } from "effect";
import type { Browser } from "playwright";
import {
  EngineeringLabelSelectorError,
  ListJobsError,
  NewPageError,
} from "../error";
import type {
  EngineeringLabel,
  EngineeringLabelSelector,
  EngineeringLabelSelectorOpenerSibling,
  EngineeringLabelSelectorRadioBtn,
  JobListPage,
  JobOverViewList,
} from "../type";

export function createPage(browser: Browser) {
  return Effect.tryPromise({
    try: () => browser.newPage(),
    catch: (e) =>
      new NewPageError({ message: `unexpected error.\n${String(e)}` }),
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
