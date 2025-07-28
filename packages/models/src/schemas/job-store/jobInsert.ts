import z from "zod";
import { ScrapedJobSchema } from "../headless-crawler";
const ISO8601 =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[\+\-]\d{2}:\d{2})$/;
export const insertJobRequestBodySchema = ScrapedJobSchema.omit({
  wage: true,
  receivedDate: true,
  workingHours: true,
  employeeCount: true,
}).extend({
  wageMin: z.number(),
  wageMax: z.number(),
  workingStartTime: z.string(),
  workingEndTime: z.string(),
  receivedDate: z.string().regex(ISO8601),
  expiryDate: z.string().regex(ISO8601),
  employeeCount: z.number(),
});

export const insertJobResponseBodySchema = insertJobRequestBodySchema.extend({
  createdAt: z.string(), // 必要なら z.string().regex(ISO8601)
  updatedAt: z.string(),
  status: z.string(),
});

// API レスポンス用スキーマ
export const insertJobSuccessResponseSchema = z.object({
  success: z.literal(true),
  result: z.object({
    job: insertJobResponseBodySchema,
  }),
});

export const insertJobClientErrorResponseSchema = z.object({
  message: z.string(),
});

export const insertJobServerErrorResponseSchema = z.object({
  message: z.string(),
});
