import { jobListSuccessResponseSchema } from "@sho/models";
import { FlexColumn, FlexN } from "../components";
import { JobOverviewList } from "../components/client/JobOverviewList";
export default async function Page() {
  const endpoint = process.env.JOB_STORE_ENDPOINT;
  if (!endpoint) {
    throw new Error("JOB_STORE_ENDPOINT is not defined");
  }
  const data = await fetch(`${endpoint}/jobs`).then((res) => res.json());
  const validatedData = jobListSuccessResponseSchema.parse(data).jobs;
  const items = validatedData.map((job) => ({
    jobNumber: job.jobNumber,
    companyName: job.companyName,
    jobTitle: job.occupation,
    employmentType: job.employmentType,
    workPlace: job.workPlace || "勤務地不明",
  }));
  return (
    <main style={{ height: "100%" }}>
      <FlexColumn>
        <FlexN n={1}>
          <h1>求人情報一覧</h1>
        </FlexN>
        <FlexN n={9}>
          <JobOverviewList items={items} />
        </FlexN>
      </FlexColumn>
    </main>
  );
}
