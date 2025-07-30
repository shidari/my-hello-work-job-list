import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import z from "zod";

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobNumber: text("jobNumber").notNull().unique(),
  companyName: text("companyName").notNull(),
  receivedDate: text("receivedDate").notNull(),
  expiryDate: text("expiryDate").notNull(),
  homePage: text("homePage"),
  occupation: text("occupation").notNull(),
  employmentType: text("employmentType").notNull(),
  wageMin: integer("wageMin").notNull(),
  wageMax: integer("wageMax").notNull(),
  workingStartTime: text("workingStartTime"),
  workingEndTime: text("workingEndTime"),
  employeeCount: integer("employeeCount").notNull(),
  workPlace: text("workPlace"),
  jobDescription: text("jobDescription"),
  qualifications: text("qualifications"),
  status: text("status").notNull().default("active"),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

// これ、キーしか型チェック指定なので、かなりfreaky
export const jobSelectSchema = z.object({
  id: z.number().int(),
  jobNumber: z.string(),
  companyName: z.string(),
  receivedDate: z.string(),
  expiryDate: z.string(),
  homePage: z.string().nullable(),
  occupation: z.string(),
  employmentType: z.string(),
  wageMin: z.number().int(),
  wageMax: z.number().int(),
  workingStartTime: z.string().nullable(),
  workingEndTime: z.string().nullable(),
  employeeCount: z.number(),
  workPlace: z.string().nullable(),
  jobDescription: z.string().nullable(),
  qualifications: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
