import {
  type JobList,
  JobOverviewSchema,
  type SearchFilter,
  type TJobOverview,
} from "@sho/models";
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

export const JobtotalCountAtom = atom(
  async (get) => {
    const { totalCount } = get(jobListAtom);
    return totalCount;
  },
  async (_get, set, newCount: number) => {
    set(jobListAtom, (prev) => ({
      ...prev,
      totalCount: newCount,
    }));
  },
);

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
      employeeCount: job.employeeCount || Number.NaN,
      receivedDate: job.receivedDate,
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

// writableなatom: 初回はlocalStorageから取得
export const favoriteJobsAtom = atom<TJobOverview[]>(
  (() => {
    try {
      const raw = localStorage.getItem("favoriteJobs");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const validated = parsed.map((item) => JobOverviewSchema.parse(item));
      return validated;
    } catch {
      return [];
    }
  })(),
);

// favoriteJobsAtomにTJobOverviewをappendし、localStorageにも書き込むwrite-only atom
export const appendFavoriteJobAtom = atom<null, [TJobOverview], void>(
  null,
  (get, set, job) => {
    const prev = get(favoriteJobsAtom);
    const next = [...prev, job];
    set(favoriteJobsAtom, next);
    localStorage.setItem("favoriteJobs", JSON.stringify(next));
  },
);

// favoriteJobsAtomからjobNumberで該当データを削除し、localStorageにも書き込むwrite-only atom
export const removeFavoriteJobAtom = atom<null, [string], void>(
  null,
  (get, set, jobNumber) => {
    const prev = get(favoriteJobsAtom);
    const next = prev.filter((job) => job.jobNumber !== jobNumber);
    set(favoriteJobsAtom, next);
    localStorage.setItem("favoriteJobs", JSON.stringify(next));
  },
);
