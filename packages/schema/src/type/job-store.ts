import type z from "zod";
import type { insertJobRequestBodySchema } from "../schema";

export type InsertJobRequestBody = z.infer<typeof insertJobRequestBodySchema>;
