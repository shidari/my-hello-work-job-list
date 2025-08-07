import { type TJobOverview, jobListSuccessResponseSchema } from "@sho/models";
import { useInfiniteQuery } from "@tanstack/react-query";

async function fetchServerPage(nextToken?: string) {
  const res = await fetch(
    `/api/proxy/job-store/jobs${nextToken ? `?nextToken=${nextToken}` : ""}`,
  );
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

export const useInfiniteJobList = ({
  initialItems,
  nextToken,
}: {
  initialItems: TJobOverview[];
  nextToken?: string;
}) => {
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["jobs"],
      queryFn: (ctx) => fetchServerPage(ctx.pageParam),
      initialData: {
        pages: [{ items: initialItems, nextToken }],
        pageParams: [nextToken],
      },
      getNextPageParam: (lastGroup) => lastGroup.nextToken,
      initialPageParam: nextToken,
    });

  return {
    items: data.pages.flatMap((page) => page.items),
    nextToken: data.pages[data.pages.length - 1].nextToken,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  };
};
