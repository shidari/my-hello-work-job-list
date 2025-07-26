import type { Locator, Page } from "playwright";
import type z from "zod";
import type { jobNumberSchema } from "../../schema/src/schema";
declare const jobSearchPage: unique symbol;
export type JobSearchPage = Page & {
  [jobSearchPage]: unknown;
};
declare const firstJobListPage: unique symbol;
export type FirstJobListPage = Page & {
  [firstJobListPage]: unknown;
};
declare const jobListPage: unique symbol;
export type JobListPage =
  | FirstJobListPage
  | (Page & {
      [jobListPage]: unknown;
    });
export type EmploymentType = "RegularEmployee" | "PartTimeWorker";
export interface DirtyWorkLocation {
  prefecture: "東京都";
}
export type EngineeringLabel = "ソフトウェア開発技術者、プログラマー";
type DirtyDesiredOccupation = EngineeringLabel;
export type JobNumber = z.infer<typeof jobNumberSchema>;
export type JobSearchCriteria = {
  jobNumber?: JobNumber;
  workLocation?: DirtyWorkLocation;
  desiredOccupation?: {
    occupationSelection?: DirtyDesiredOccupation;
  };
  employmentType?: EmploymentType;
};
export type EngineeringLabelSelector = {
  radioBtn: EngineeringLabelSelectorRadioBtn;
  openerSibling: EngineeringLabelSelectorOpenerSibling;
};
declare const engineeringLabelSelectorRadioBtn: unique symbol;
export type EngineeringLabelSelectorRadioBtn = string & {
  [engineeringLabelSelectorRadioBtn]: unknown;
};
declare const engineeringLabelSelectorOpener: unique symbol;
export type EngineeringLabelSelectorOpenerSibling = string & {
  [engineeringLabelSelectorOpener]: unknown;
};
declare const jobOverviewList: unique symbol;
export type JobOverViewList = Locator[] & {
  [jobOverviewList]: unknown;
};
declare const emplomentTypeSelector: unique symbol;
export type EmploymentTypeSelector = string & {
  [emplomentTypeSelector]: unknown;
};
