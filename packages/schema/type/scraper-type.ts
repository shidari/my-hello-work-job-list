import type { Page } from "playwright";
import type { JobNumber } from "./shared-type";

const r = Symbol();
export type ReceivedDate = string & { [r]: unknown };

const h = Symbol();
export type HomePage = string & { [h]: unknown };

const e = Symbol();
export type ExpiryDate = string & { [e]: unknown };

const ec = Symbol();
export type EmployeetCount = number & { [ec]: unknown };
export type JobInfo = {
  jobNumber: JobNumber;
  companyName: string;
  receivedDate: ReceivedDate;
  expiryDate: ExpiryDate;
  homePage: HomePage;
  occupation: string;
  employmentType: string;
  wage: string;
  workingHours: string;
  employeeCount: EmployeetCount;
};

const jobDetailPage = Symbol();
export type JobDetailPage = Page & { [jobDetailPage]: unknown };
