"use client";

import { type TJobOverview, jobListSuccessResponseSchema } from "@sho/models";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import { JobOverview } from "../Job";

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
export function JobOverviewList({
  initialItems,
  nextToken,
}: { initialItems: TJobOverview[]; nextToken?: string }) {
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

  const jobListInfo = useMemo(() => {
    return {
      items: data.pages.flatMap((page) => page.items),
      nextToken: data.pages[data.pages.length - 1].nextToken,
    };
  }, [data]);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: jobListInfo.items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250, // 内部計算用はpxのまま
  });

  const totalSize = rowVirtualizer.getTotalSize();

  // biome-ignore lint/correctness/useExhaustiveDependencies: https://tanstack.com/virtual/latest/docs/framework/react/examples/infinite-scroll 一旦この通りに書いた、後で必要に応じて修正する
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) {
      return;
    }
    if (lastItem.index >= jobListInfo.items.length - 1) {
      fetchNextPage();
    }
  }, [
    rowVirtualizer.getVirtualItems(),
    hasNextPage,
    fetchNextPage,
    jobListInfo.items.length,
    isFetchingNextPage,
  ]);

  return (
    <div ref={parentRef} style={{ height: "100%", overflow: "auto" }}>
      <div
        style={{
          height: `${totalSize}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const item = jobListInfo.items[virtualItem.index];
          return (
            <div
              key={item.jobNumber}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <section className="job-overview">
                <Link href={`/jobs/${item.jobNumber}`}>
                  <JobOverview
                    jobNumber={item.jobNumber}
                    companyName={item.companyName}
                    jobTitle={item.jobTitle}
                    employmentType={item.employmentType}
                    workPlace={item.workPlace}
                  />
                </Link>
              </section>
            </div>
          );
        })}
        {isFetchingNextPage && (
          <div>
            <p>Loading more jobs...</p>
          </div>
        )}
      </div>
    </div>
  );
}
