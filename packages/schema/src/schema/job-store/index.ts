import z from "zod";
import { ScrapedJobSchema } from "../headless-crawler";

// API リクエスト用（作成時）
export const insertJobRequestBodySchema = ScrapedJobSchema.omit({
  wage: true,
  workingHours: true,
}).extend({
  wageMax: z.number(),
  wageMin: z.number(),
  workingStartTime: z.string().optional(),
  workingEndTime: z.string().optional(),
});

// DB/レスポンス用（createdAt なども含む）
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
