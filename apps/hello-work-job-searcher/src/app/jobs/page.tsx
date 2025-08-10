export const dynamic = "force-dynamic";

import type { TJobOverview } from "@sho/models";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { FlexColumn, FlexN } from "../components";
import { JobOverviewList } from "../components/client/components/JobOverViewList";
import { JobsPageClient } from "../components/client/components/JobsPageClient";
import { SearchFilter } from "../components/client/components/SearchFilter";
import { jobStoreClient } from "../store/client";

export default async function Page() {
  // 一旦対応めんどいからunsafeUnwrapを使う
  const data = (await jobStoreClient.getJobs())._unsafeUnwrap();
  const initialItems: TJobOverview[] = data.jobs.map((job) => ({
    jobNumber: job.jobNumber,
    companyName: job.companyName,
    jobTitle: job.occupation,
    employmentType: job.employmentType,
    workPlace: job.workPlace || "不明",
  }));

  const queryClient = new QueryClient(); // QueryClientに初期データをプリロード
  queryClient.setQueryData(["jobs"], {
    pages: [
      {
        items: initialItems,
        nextToken: data.nextToken,
      },
    ],
    pageParams: [data.nextToken],
  });
  return (
    <JobsPageClient dehydratedState={dehydrate(queryClient)}>
      <main style={{ height: "100%" }}>
        <FlexColumn>
          <FlexN n={1}>
            <h1>求人情報一覧</h1>
          </FlexN>
          <FlexN n={9}>
            <SearchFilter />
            <JobOverviewList />
          </FlexN>
        </FlexColumn>
      </main>
    </JobsPageClient>
  );
}
