"use client";

import { type TJobOverview, jobListSuccessResponseSchema } from "@sho/models";
import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { JobOverview } from "../Job";
export function JobOverviewList({
  initialItems,
  nextToken,
}: { initialItems: TJobOverview[]; nextToken?: string }) {
  const [jobListInfo, setJobListInfo] = useState({
    items: initialItems,
    nextToken: nextToken,
  });
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
      (async () => {
        // Use lastItem from outer scope, no need to recalculate
        const res = await fetch(
          `/api/proxy/job-store/jobs?nextToken=${jobListInfo.nextToken}`,
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
        const newNextToken = validatedData.nextToken;
        if (!newNextToken) {
          return;
        }
        setJobListInfo((prev) => ({
          items: [...prev.items, ...nextItems],
          nextToken: newNextToken,
        }));
        rowVirtualizer.scrollToIndex(jobListInfo.items.length);
      })();
    }
  }, [rowVirtualizer.getVirtualItems()]);

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
      </div>
    </div>
  );
}
