import type { JobNumber } from "./shared-type";

export type JobMetadata = {
  jobNumber: JobNumber;
};

export type NewJobOpeningsFilter = "TodayYesterday" | "Within1Week";
