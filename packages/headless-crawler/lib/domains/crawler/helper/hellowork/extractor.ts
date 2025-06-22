import { Effect } from "effect";
import { ExtractJobNumbersError } from "../../../shared/error";
import { validateJobNumber } from "../../../shared/helper/validator";
import type { JobOverViewList } from "../../../shared/type";

export function extractJobNumbers(jobOverviewList: JobOverViewList) {
  return Effect.forEach(jobOverviewList, (table) => {
    return Effect.gen(function* () {
      const rawJobNumber = yield* Effect.tryPromise({
        try: () => {
          return Promise.all(
            jobOverviewList.map(async (table) => {
              const text = await table
                .locator("div.right-side")
                .locator("tr")
                .nth(3)
                .locator("td")
                .nth(1)
                .textContent();
              if (!text) {
                return Effect.fail(
                  new ExtractJobNumbersError({ message: "jobNumber is null" }),
                );
              }
              return text;
            }),
          );
        },
        catch: (e) =>
          new ExtractJobNumbersError({
            message: `unexpected error. ${String(e)}`,
          }),
      });
      const jobNumber = yield* validateJobNumber(rawJobNumber);
      return jobNumber;
    });
  });
}
