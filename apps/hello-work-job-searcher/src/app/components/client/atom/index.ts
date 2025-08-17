import type { JobList, SearchFilter, TJobOverview } from "@sho/models";
import type { VirtualItem } from "@tanstack/react-virtual";
import { atom } from "jotai";
import { jobStoreClientOnBrowser } from "@/app/store/client";

// ジョブリストのatom（初期値をオブジェクトに修正）
export const jobListAtom = atom<{
  jobs: JobList;
  nextToken: string | undefined;
  totalCount: number;
}>({
  jobs: [],
  nextToken: undefined,
  totalCount: 0,
});

export const JobtotalCountAtom = atom((get) => {
  const { totalCount } = get(jobListAtom);
  return totalCount;
});

export const JobOverviewListAtom = atom<{
  items: TJobOverview[];
  nextToken: string | undefined;
}>((get) => {
  const { jobs, nextToken } = get(jobListAtom);
  return {
    items: jobs.map((job) => ({
      jobNumber: job.jobNumber,
      companyName: job.companyName,
      jobTitle: job.occupation,
      employmentType: job.employmentType,
      workPlace: job.workPlace || "不明",
    })),
    nextToken,
  };
});

export const initializeJobListWriterAtom = atom<
  null,
  [SearchFilter],
  Promise<void>
>(null, async (_, set, searchFilter) => {
  const {
    jobs,
    nextToken,
    meta: { totalCount },
  } = (
    await jobStoreClientOnBrowser.getInitialJobs(searchFilter)
  )._unsafeUnwrap();
  set(jobListAtom, {
    jobs,
    nextToken,
    totalCount,
  });
});

// 書き込み専用atom: getContinuedJobsを叩いてリストを更新
export const continuousJobOverviewListWriterAtom = atom<
  null,
  [string],
  Promise<void>
>(null, async (_get, set, nextToken) => {
  const {
    jobs,
    nextToken: newNextToken,
    meta: { totalCount },
  } = (
    await jobStoreClientOnBrowser.getContinuedJobs(nextToken)
  )._unsafeUnwrap();
  set(jobListAtom, (prev) => ({
    jobs: [...prev.jobs, ...jobs],
    nextToken: newNextToken,
    totalCount: totalCount,
  }));
});

export const scrollRestorationByItemIndexAtom = atom(0);
// あまり直接的に外部ライブラリのインターフェースに依存させたくないが、仕方なく
export const scrollRestorationByItemListAtom = atom<VirtualItem[]>([]);
