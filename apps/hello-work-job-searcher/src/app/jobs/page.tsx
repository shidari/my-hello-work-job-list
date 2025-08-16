export const dynamic = "force-dynamic";

import type { TJobOverview } from "@sho/models";
import { FlexColumn, FlexN } from "../components";
import { JobOverviewList } from "../components/client/components/JobOverViewList";
import { jobStoreClientOnServer } from "../store/server";

export default async function Page() {
  // 一旦対応めんどいからunsafeUnwrapを使う
  const data = (await jobStoreClientOnServer.getInitialJobs())._unsafeUnwrap();
  const initialItems: TJobOverview[] = data.jobs.map((job) => ({
    jobNumber: job.jobNumber,
    companyName: job.companyName,
    jobTitle: job.occupation,
    employmentType: job.employmentType,
    workPlace: job.workPlace || "不明",
  }));
  return (
    <main style={{ height: "100%" }}>
      <FlexColumn>
        <FlexN n={1}>
          <h1>求人情報一覧</h1>
        </FlexN>
        <FlexN n={9}>
          <JobOverviewList
            initialDataFromServer={{
              items: initialItems,
              nextToken: data.nextToken,
            }}
          />
        </FlexN>
      </FlexColumn>
    </main>
  );
}
