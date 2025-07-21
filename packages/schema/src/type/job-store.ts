import type z from "zod";
import type { insertJobRequestBodySchema } from "../schema";

export type JobInsertReqeustBody = z.infer<typeof insertJobRequestBodySchema>;
