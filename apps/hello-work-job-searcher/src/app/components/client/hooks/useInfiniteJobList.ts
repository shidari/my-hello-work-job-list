import { jobListSuccessResponseSchema, type TJobOverview } from "@sho/models";
import { useInfiniteQuery } from "@tanstack/react-query";

async function fetchContinuesJobList(nextToken: string) {
  const url = `/api/proxy/job-store/jobs/continue?nextToken=${nextToken}`;
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

export const useInfiniteJobList = () => {
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["jobs"],
      // 一旦面倒なので、エラー潰すため的なことしてる。あとで絶対修正しないといけない
      queryFn: (ctx) =>
        ctx.pageParam
          ? fetchContinuesJobList(ctx.pageParam)
          : Promise.resolve({ items: [], nextToken: undefined }),
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
