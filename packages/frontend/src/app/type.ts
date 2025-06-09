// APIエンドポイントとの齟齬なんとかしたいけど後回し
export type Job = {
	jobNumber: string;
	companyName: string;
	jobTitle: string;
	salaly: string;
	employmentType: string;
	workPlace: string;
	jobDescription: string;
	expiryDate: string;
	workingHours: string;
	qualifications?: string;
};

// JobOverviewコンポーネントと命名がバッティングしてしまうため、後で名前考える
export type TJobOverview = Pick<
	Job,
	"jobNumber" | "companyName" | "employmentType" | "jobTitle" | "workPlace"
>;
