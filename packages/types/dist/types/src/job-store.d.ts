import type z from "zod";
import type { insertJobRequestBodySchema } from "../../schema/src/schema";
export type InsertJobRequestBody = z.infer<typeof insertJobRequestBodySchema>;
