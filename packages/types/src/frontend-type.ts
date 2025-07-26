import type z from "zod";
import type {
  JobDetailSchema,
  JobOverviewSchema,
} from "../../schema/src/schema/frontend";

export type TJobOverview = z.infer<typeof JobOverviewSchema>;
export type TJobDetail = z.infer<typeof JobDetailSchema>;
