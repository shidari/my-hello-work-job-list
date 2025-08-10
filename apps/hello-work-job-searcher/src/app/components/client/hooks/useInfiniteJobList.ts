import {
  jobListSuccessResponseSchema,
  type SearchFilter,
  type TJobOverview,
} from "@sho/models";
import { useInfiniteQuery } from "@tanstack/react-query";

async function fetchServerPage(
  nextToken?: string,
  searchFilter: SearchFilter = {},
) {
  // クエリパラメータを構築
  const params = new URLSearchParams();
  if (nextToken) {
    params.append("nextToken", nextToken);
  }
  if (searchFilter.companyName) {
    params.append("companyName", searchFilter.companyName);
  }

  const queryString = params.toString();
  const url = `/api/proxy/job-store/jobs${queryString ? `?${queryString}` : ""}`;
  const res = await fetch(url);
  const data = await res.json();
  const validatedData = jobListSuccessResponseSchema.parse(data);
  const nextItems: TJobOverview[] = validatedData.jobs.map((job) => ({
    jobNumber: job.jobNumber,
    companyName: job.companyName,
    jobTitle: job.occupation,
    employmentType: job.employmentType,
    workPlace: job.workPlace || "不明",
  }));
  return { items: nextItems, nextToken: validatedData.nextToken };
}

export const useInfiniteJobList = (searchFilter: SearchFilter = {}) => {
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["jobs", searchFilter],
      queryFn: (ctx) => fetchServerPage(ctx.pageParam, searchFilter),
      getNextPageParam: (lastGroup) => lastGroup.nextToken,
      initialPageParam: undefined as string | undefined, // 型を明示的に指定
      staleTime: 1000 * 60 * 5,
    });

  return {
    items: data?.pages.flatMap((page) => page.items) || [],
    nextToken: data?.pages[data.pages.length - 1]?.nextToken,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
  };
};
