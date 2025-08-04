import { FlexColumn, FlexN } from "@/app/components";
import { JobDetail } from "@/app/components/Job";
import { jobFetchSuccessResponseSchema } from "@sho/models";

interface PageProps {
  params: Promise<{ jobNumber: string }>;
}

export default async function Page({ params }: PageProps) {
  const { jobNumber } = await params;

  const endpoint = process.env.JOB_STORE_ENDPOINT;
  if (!endpoint) {
    throw new Error("JOB_STORE_ENDPOINT is not defined");
  }
  const data = await fetch(`${endpoint}/job/${jobNumber}`).then((res) =>
    res.json(),
  );
  const validatedData = jobFetchSuccessResponseSchema.parse(data);
  const jobDetail = {
    ...validatedData,
    workingHours: `${validatedData.workingStartTime}〜${validatedData.workingEndTime}`,
    jobTitle: validatedData.occupation,
    salary: `${validatedData.wageMin}円〜${validatedData.wageMax}円`,
    workPlace: validatedData.workPlace ?? "未記載",
    jobDescription: validatedData.jobDescription ?? "未記載",
    qualifications: validatedData.qualifications ?? "未記載",
  };

  return (
    <main>
      <FlexColumn>
        <FlexN n={1}>
          <h1>求人情報一覧</h1>
        </FlexN>
        <FlexN n={9}>
          <JobDetail jobDetail={jobDetail} />
        </FlexN>
      </FlexColumn>
    </main>
  );
}
