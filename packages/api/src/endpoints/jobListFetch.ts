import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, JobDescription } from "../types";

export class JobList extends OpenAPIRoute {
	schema = {
		tags: ["Jobs"],
		summary: "List Jobs",
		request: {
			query: z.object({}),
		},
		responses: {
			"200": {
				description: "Returns a list of jobs",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: Bool(),
								result: z.object({
									jobs: JobDescription.array(),
								}),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(_: AppContext) {
		return {
			success: true,
			jobs: [
				{
					companyName: "山田製作所",
					jobTitle: "製造スタッフ",
					employmentType: "正社員",
					workPlace: "東京都大田区",
				},
				{
					companyName: "グリーンカフェ",
					jobTitle: "ホールスタッフ",
					employmentType: "パート",
					workPlace: "大阪市中央区",
				},
				{
					companyName: "TechBridge合同会社",
					jobTitle: "バックエンドエンジニア",
					employmentType: "正社員",
					workPlace: "フルリモート",
				},
			],
		};
	}
}
