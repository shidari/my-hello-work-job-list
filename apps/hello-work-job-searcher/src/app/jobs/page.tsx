export const dynamic = "force-dynamic";

import { FlexColumn, FlexN } from "../components";
import { JobOverviewList } from "../components/client/components/JobOverViewList";
import { jobStoreClientOnServer } from "../store/server";

export default async function Page() {
  // 一旦対応めんどいからunsafeUnwrapを使う
  const data = (await jobStoreClientOnServer.getInitialJobs())._unsafeUnwrap();
  return (
    <main style={{ height: "100%" }}>
      <FlexColumn>
        <FlexN n={1}>
          <h1>求人情報一覧</h1>
        </FlexN>
        <FlexN n={9}>
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
