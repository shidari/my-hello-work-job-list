import z from "zod";
import { EmploymentTypeSchema } from "../headless-crawler";

export const JobOverviewSchema = z.object({
  jobNumber: z.string(),
  companyName: z.string(),
  workPlace: z.string(),
  jobTitle: z.string(),
  employmentType: z.string(), // 後でもっと型を細かくする
});

export const JobDetailSchema = JobOverviewSchema.extend({
  salaly: z.string(),
  jobDescription: z.string(),
  expiryDate: z.string(),
  workingHours: z.string(),
  qualifications: z.string(),
});
