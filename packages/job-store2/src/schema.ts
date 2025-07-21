import z from "zod";

// 雇用形態のEnum
export const EmploymentType = z.enum([
  "正社員",
  "パート労働者",
  "正社員以外",
  "有期雇用派遣労働者",
]);
export type EmploymentType = z.infer<typeof EmploymentType>;

// 共通フィールド（JobInfoベース）
const baseJobInfoFields = {
  jobNumber: z.string().regex(/^\d{5}-\d{0,8}$/, {
    message: "jobNumber format invalid.",
  }),
  companyName: z.string(),
  homePage: z.string().url().nullable(),
  occupation: z.string().min(1, { message: "occupation should not be empty." }),
  employmentType: EmploymentType,
};

// API リクエスト用（作成時）
export const requestBodySchema = z.object({
  ...baseJobInfoFields,
  wageMax: z.number(),
  wageMin: z.number(),
  workingStartTime: z.string().optional(),
  workingEndTime: z.string().optional(),
  receivedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "invalid ISO date" }),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "invalid ISO date" }),
  employeeCount: z.number().int().min(0),
});

export type RequestBody = z.infer<typeof requestBodySchema>;

// DB/レスポンス用（createdAt なども含む）
export const JobSchema = requestBodySchema.extend({
  createdAt: z.string(), // 必要なら z.string().regex(ISO8601)
  updatedAt: z.string(),
  status: z.string(),
});

// API レスポンス用スキーマ
export const successResponseSchema = z.object({
  success: z.literal(true),
  result: z.object({
    job: JobSchema,
  }),
});

export const clientErrorResponse = z.object({
  message: z.string(),
});

export const serverErrorResponse = z.object({
  message: z.string(),
});
