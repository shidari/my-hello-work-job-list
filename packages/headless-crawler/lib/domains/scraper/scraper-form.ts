import type { JobNumber, JobSearchPage } from "@sho/schema";
import { Effect } from "effect";
import { FillJobNumberError } from "./scraper-error";

export function fillJobNumber(page: JobSearchPage, jobNumber: JobNumber) {
  return Effect.tryPromise({
    try: async () => {
      const jobNumberSplits = jobNumber.split("-");
      const firstJobNumber = jobNumberSplits.at(0);
      const secondJobNumber = jobNumberSplits.at(1);
      if (!firstJobNumber)
        throw new FillJobNumberError({
          message: `firstJobnumber undefined. jobNumber=${jobNumber}`,
        });
      if (!secondJobNumber)
        throw new FillJobNumberError({
          message: `secondJobNumber undefined. jobNumber=${jobNumber}`,
        });
      const firstJobNumberInput = page.locator("#ID_kJNoJo1");
      const secondJobNumberInput = page.locator("#ID_kJNoGe1");
      await firstJobNumberInput.fill(firstJobNumber);
      await secondJobNumberInput.fill(secondJobNumber);
    },
    catch: (e) =>
      new FillJobNumberError({
        message: `unexpected error.\njobNumber=${jobNumber}\n${String(e)}`,
      }),
  });
}
