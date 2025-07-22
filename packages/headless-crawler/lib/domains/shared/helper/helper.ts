import type {
  EngineeringLabel,
  EngineeringLabelSelector,
  EngineeringLabelSelectorOpenerSibling,
  EngineeringLabelSelectorRadioBtn,
  JobDetailPage,
  JobListPage,
  JobOverViewList,
  insertJobRequestBodySchema,
} from "@sho/schema";
import { Effect } from "effect";
import {
  type Browser,
  type BrowserContext,
  type LaunchOptions,
  chromium,
} from "playwright";
import type { z } from "zod";
import {
  EngineeringLabelSelectorError,
  GetEndPointError,
  HomePageElmNotFoundError,
  InsertJobError,
  LaunchBrowserError,
  ListJobsError,
  NewContextError,
  NewPageError,
  QualificatiosElmNotFoundError,
} from "../error";
import { validateInsertJobSuccessResponse } from "./validator";

export function launchBrowser(options: LaunchOptions) {
  return Effect.acquireRelease(
    Effect.gen(function* () {
      const browser = yield* Effect.tryPromise({
        try: () => chromium.launch({ ...options }),
        catch: (e) =>
          new LaunchBrowserError({
            message: `unexpected error.\n${String(e)}`,
          }),
      });
      return { browser };
    }),
    ({ browser }) => Effect.promise(() => browser.close()),
  ).pipe(Effect.map(({ browser }) => browser));
}

export function createContext(browser: Browser) {
  return Effect.acquireRelease(
    Effect.gen(function* () {
      const context = yield* Effect.tryPromise({
        try: () => browser.newContext(),
        catch: (e) =>
          new NewContextError({ message: `unexpetcted error.\n${String(e)}` }),
      });
      return { context };
    }),
    ({ context }) => Effect.promise(() => context.close()),
  ).pipe(Effect.map(({ context }) => context));
}

export function createPage(context: BrowserContext) {
  return Effect.acquireRelease(
    Effect.gen(function* () {
      const page = yield* Effect.tryPromise({
        try: () => context.newPage(),
        catch: (e) =>
          new NewPageError({ message: `unexpected error.\n${String(e)}` }),
      });
      page.setDefaultTimeout(20000);
      page.setDefaultNavigationTimeout(200000);
      return { page };
    }),
    ({ page }) => Effect.promise(() => page.close()),
  ).pipe(Effect.map(({ page }) => page));
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

export function homePageElmExists(page: JobDetailPage) {
  return Effect.tryPromise({
    try: async () => {
      const homePageLoc = page.locator("#ID_hp");
      const count = await homePageLoc.count();
      return count === 1;
    },
    catch: (e) =>
      new HomePageElmNotFoundError({
        message: `unexpected error\n${String(e)}`,
      }),
  });
}
export function qualificationsElmExists(page: JobDetailPage) {
  return Effect.tryPromise({
    try: async () => {
      const homePageLoc = page.locator("#ID_hynaMenkyoSkku");
      const count = await homePageLoc.count();
      return count === 1;
    },
    catch: (e) =>
      new QualificatiosElmNotFoundError({
        message: `unexpected error\n${String(e)}`,
      }),
  });
}

const getEndPoint = () => {
  const endpoint = process.env.JOB_STORE_ENDPOINT;
  if (!endpoint)
    return Effect.fail(
      new GetEndPointError({
        message: `cannot get endpoint. endpoint=${endpoint}`,
      }),
    );
  return Effect.succeed(endpoint);
};
export function buildJobStoreClient() {
  return Effect.gen(function* () {
    const endpoint = yield* getEndPoint();
    return {
      insertJob: (job: z.infer<typeof insertJobRequestBodySchema>) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(
            `executing insert job api. job=${JSON.stringify(job, null, 2)}`,
          );
          const res = yield* Effect.tryPromise({
            try: async () =>
              fetch(`${endpoint}/job`, {
                method: "POST",
                body: JSON.stringify(job),
                headers: { "content-type": "application/json" },
              }),
            catch: (e) =>
              new InsertJobError({
                message: `insert job response failed.\n${String(e)}`,
              }),
          });
          if (!res.ok) {
            throw new InsertJobError({
              message: `insert job failed.\nstatus=${res.status}\nstatusText=${res.statusText}`,
            });
          }
          const data = yield* Effect.tryPromise({
            try: () => res.json(),
            catch: (e) =>
              new InsertJobError({
                message: `insert job transforming json failed.\n${String(e)}`,
              }),
          });
          yield* Effect.logDebug(
            `response data. ${JSON.stringify(data, null, 2)}`,
          );
          const validated = yield* validateInsertJobSuccessResponse(data);
          return validated;
        }),
    };
  });
}
