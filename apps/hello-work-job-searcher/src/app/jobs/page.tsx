export const dynamic = "force-dynamic";

import { type TJobOverview, jobListSuccessResponseSchema } from "@sho/models";
import { FlexColumn, FlexN } from "../components";
import { JobOverviewList } from "../components/client/JobOverviewList";

export default async function Page() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:9002";
  console.log({ endpoint: baseUrl });
  const res = await fetch(`${baseUrl}/api/proxy/job-store/jobs`);
  const data = await res.json();
  const validatedData = jobListSuccessResponseSchema.parse(data);
  const initialItems: TJobOverview[] = validatedData.jobs.map((job) => ({
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
            initialItems={initialItems}
            nextToken={validatedData.nextToken}
          />
        </FlexN>
      </FlexColumn>
    </main>
  );
}
