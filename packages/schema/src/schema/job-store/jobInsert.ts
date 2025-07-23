import z from "zod";
import { ScrapedJobSchema } from "../headless-crawler";
import {
  transformedEmployeeCountSchema,
  transformedExpiryDateSchema,
  transformedReceivedDateSchema,
} from "./transformer";

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
  receivedDate: transformedReceivedDateSchema,
  expiryDate: transformedExpiryDateSchema,
  employeeCount: transformedEmployeeCountSchema,
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
