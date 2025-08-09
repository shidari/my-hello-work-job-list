// JobsPageClient.tsx (新規作成) - Client Component
"use client";

import { type DehydratedState, HydrationBoundary } from "@tanstack/react-query";

interface JobsPageClientProps {
  dehydratedState: DehydratedState;
  children: React.ReactNode;
}

export function JobsPageClient({
  dehydratedState,
  children,
}: JobsPageClientProps) {
  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}
