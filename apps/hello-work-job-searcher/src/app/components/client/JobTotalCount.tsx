"use client";

import { useAtomValue } from "jotai";
import { JobtotalCountAtom } from "./atom";

export const JobtotalCount = () => {
  const totalCount = useAtomValue(JobtotalCountAtom);
  return <div>求人情報の総数: {totalCount}件</div>;
};
