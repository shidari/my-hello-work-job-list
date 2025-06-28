import type { JobListPage } from "@sho/schema";
import { Effect } from "effect";
import { listJobOverviewElem } from "../shared/helper/helper";
import { AssertSingleJobListedError } from "./scraper-error";

export function assertSingleJobListed(page: JobListPage) {
  return Effect.gen(function* () {
    const jobOverViewList = yield* listJobOverviewElem(page);
    if (jobOverViewList.length !== 1)
      return yield* Effect.fail(
        new AssertSingleJobListedError({
          message: `job list count should be 1 but ${jobOverViewList.length}`,
        }),
      );
  });
}
