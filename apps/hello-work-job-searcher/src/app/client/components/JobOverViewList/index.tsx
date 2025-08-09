"use client";

import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { useAtomValue } from "jotai";
import Link from "next/link";
import React, { useEffect } from "react";
import { JobOverview } from "@/app/components/Job";
import { searchFilterAtom } from "../../atoms";
import { useInfiniteJobList } from "../../hooks/useInfiniteJobList";
import styles from "./JobOverviewList.module.css";

let _kSavedOffset = 0;
let _kMeasurementsCache = [] as VirtualItem[];

export function JobOverviewList() {
  const filter = useAtomValue(searchFilterAtom); // 状態管理からフィルターを取得
  const { items, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteJobList(filter);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250, // 内部計算用はpxのまま
    initialOffset: _kSavedOffset,
    initialMeasurementsCache: _kMeasurementsCache,
    onChange: (virtualizer) => {
      if (!virtualizer.isScrolling) {
        _kMeasurementsCache = virtualizer.measurementsCache;
        _kSavedOffset = virtualizer.scrollOffset || 0;
      }
    },
  });

  const totalSize = rowVirtualizer.getTotalSize();

  // biome-ignore lint/correctness/useExhaustiveDependencies: https://tanstack.com/virtual/latest/docs/framework/react/examples/infinite-scroll 一旦この通りに書いた、後で必要に応じて修正する
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) {
      return;
    }
    if (lastItem.index >= items.length - 1) {
      fetchNextPage();
    }
  }, [
    rowVirtualizer.getVirtualItems(),
    hasNextPage,
    fetchNextPage,
    items.length,
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
              <section className={styles.jobOverview}>
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
          <div className={styles.loadingMore}>
            <p>Loading more jobs...</p>
          </div>
        )}
      </div>
    </div>
  );
}
