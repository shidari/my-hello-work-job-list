import type z from "zod";
import type {
  JobDetailSchema,
  JobOverviewSchema,
} from "../../schemas/frontend";

export type TJobOverview = z.infer<typeof JobOverviewSchema>;
export type TJobDetail = z.infer<typeof JobDetailSchema>;
