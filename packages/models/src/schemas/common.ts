import { z } from "zod";

export const ISODateSchema = z
  .string()
  .refine((str) => !Number.isNaN(Date.parse(str)), {
    message: "有効なISO 8601日付ではありません",
  });
