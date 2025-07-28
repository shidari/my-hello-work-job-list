import type z from "zod";
import type { insertJobRequestBodySchema } from "../../schemas";

export type InsertJobRequestBody = z.infer<typeof insertJobRequestBodySchema>;
