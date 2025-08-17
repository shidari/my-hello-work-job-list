export const dynamic = "force-dynamic";

import { FlexColumn, FlexN } from "../components";
import { JobOverviewList } from "../components/client/JobOverViewList";
import { JobsSearchfilter } from "../components/client/JobsSearchfilter";
import { JobtotalCount } from "../components/client/JobTotalCount";
import { jobStoreClientOnServer } from "../store/server";

export default async function Page() {
  // 一旦対応めんどいからunsafeUnwrapを使う
  const data = (await jobStoreClientOnServer.getInitialJobs())._unsafeUnwrap();
  return (
    <main style={{ height: "100%" }}>
      <FlexColumn>
        <FlexN n={2}>
          <h1>求人情報一覧</h1>
          <JobtotalCount />
          <JobsSearchfilter />
        </FlexN>
        <FlexN n={8}>
          <JobOverviewList
            initialDataFromServer={{
              jobs: data.jobs,
              nextToken: data.nextToken,
              totalCount: data.meta.totalCount,
            }}
          />
        </FlexN>
      </FlexColumn>
    </main>
  );
}
