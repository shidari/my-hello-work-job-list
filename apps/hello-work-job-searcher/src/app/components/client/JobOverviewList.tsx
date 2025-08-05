"use client";

import type { TJobOverview } from "@sho/models";
import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import React from "react";
import { JobOverview } from "../Job";

export function JobOverviewList({ items }: { items: TJobOverview[] }) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250, // 内部計算用はpxのまま
  });

  const totalSize = rowVirtualizer.getTotalSize();

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
          const item = items[virtualItem.index];
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
