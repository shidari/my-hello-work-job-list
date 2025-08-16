import type { TJobOverview } from "@sho/models";
import { atom } from "jotai";
import { jobStoreClientOnBrowser } from "@/app/store/client";

// ジョブリストのatom（初期値をオブジェクトに修正）
export const JobOverviewListAtom = atom<{
  items: TJobOverview[];
  nextToken: string | undefined;
}>({
  items: [],
  nextToken: undefined,
});

// 書き込み専用atom: getContinuedJobsを叩いてリストを更新
export const continuousJobOverviewListWriterAtom = atom<
  null,
  [string],
  Promise<void>
>(null, async (_get, set, nextToken) => {
  const { jobs, nextToken: newNextToken } = (
    await jobStoreClientOnBrowser.getContinuedJobs(nextToken)
  )._unsafeUnwrap();
  const newItems = jobs.map((job) => ({
    jobNumber: job.jobNumber,
    companyName: job.companyName,
    jobTitle: job.occupation,
    employmentType: job.employmentType,
    workPlace: job.workPlace || "不明",
  }));
  set(JobOverviewListAtom, (prev) => ({
    items: [...prev.items, ...newItems],
    nextToken: newNextToken,
  }));
});
