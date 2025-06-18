import type { LaunchOptions, Locator, Page } from "playwright";
import type {
	FillOccupationFieldError,
	FillPrefectureFieldError,
	FillWorkTypeError,
	GoToHelloWorkSearchPageError,
	IsNextPageEnabledError,
	JobListPagenationError,
	NextJobListPageError,
	SearchThenGotoFirstJobListPageError,
	ValidateJobListPageError,
	ValidateJobSearchPageError,
} from "./error";

export type JobMetadata = {
	jobNumber: JobNumber;
};

const helloWorkSearchPageBrand = Symbol();

export type HelloWorkSearchPage = Page & {
	[helloWorkSearchPageBrand]: unknown;
};
const firstJobListPage = Symbol();

export type FirstJobListPage = Page & { [firstJobListPage]: unknown };
const jobListPage = Symbol();

export type JobListPage =
	| FirstJobListPage
	| (Page & { [jobListPage]: unknown });

export interface DirtyWorkLocation {
	prefecture: "東京都";
}

export type EmploymentType = "RegularEmployee" | "PartTimeWorker";

export type NewJobOpeningsFilter = "TodayYesterday" | "Within1Week";

export type EngineeringLabel = "ソフトウェア開発技術者、プログラマー";

const engineeringLabelSelectorRadioBtn = Symbol();
export type EngineeringLabelSelectorRadioBtn = string & {
	[engineeringLabelSelectorRadioBtn]: unknown;
};
const engineeringLabelSelectorOpener = Symbol();

//　直接openerのセレクタをとってこれないため
export type EngineeringLabelSelectorOpenerSibling = string & {
	[engineeringLabelSelectorOpener]: unknown;
};

const jobOverviewList = Symbol();
export type JobOverViewList = Locator[] & {
	[jobOverviewList]: unknown;
};
const jobNumber = Symbol();

export type JobNumber = string & {
	[jobNumber]: unknown;
};

export type EngineeringLabelSelector = {
	radioBtn: EngineeringLabelSelectorRadioBtn;
	openerSibling: EngineeringLabelSelectorOpenerSibling;
};

type DirtyDesiredOccupation = EngineeringLabel;

export type JobSearchCriteria = {
	workLocation?: DirtyWorkLocation;
	desiredOccupation?: {
		occupationSelection?: DirtyDesiredOccupation;
	};
	employmentType?: EmploymentType;
};

export type HelloWorkCrawlingConfig = {
	roughMaxCount: number;
	browserConfig: Pick<LaunchOptions, "headless" | "timeout">;
	debugLog: boolean;
	nextPageDelayMs: number;
	jobSearchCriteria: JobSearchCriteria;
};

export type PagenationError =
	| JobListPagenationError
	| NextJobListPageError
	| SearchThenGotoFirstJobListPageError
	| IsNextPageEnabledError
	| GoToHelloWorkSearchPageError;

export type FillFormError =
	| FillWorkTypeError
	| FillPrefectureFieldError
	| FillOccupationFieldError;

export type ValidationError =
	| ValidateJobListPageError
	| ValidateJobSearchPageError;
