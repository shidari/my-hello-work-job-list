import { Effect } from "effect";
import { listJobOverviewElem } from "../common/helper";
import type { JobListPage } from "../crawler/type";
import { AssertSingleJobListed } from "./error";

export function assertSingleJobListed(page: JobListPage) {
  return Effect.gen(function* () {
    const jobOverViewList = yield* listJobOverviewElem(page);
    if (jobOverViewList.length !== 1)
      throw new AssertSingleJobListed({
        message: `job list count should be 1 but ${jobOverViewList.length}`,
      });
  });
}
