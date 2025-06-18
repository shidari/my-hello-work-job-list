import { defineHelloWorkCrawlingConfig } from "./config";
export default defineHelloWorkCrawlingConfig({
	roughMaxCount: 100,
	browserConfig: {
		headless: false,
		timeout: 10000,
	},
	nextPageDelayMs: 3000,
	debugLog: true,
	jobSearchCriteria: {
		workLocation: { prefecture: "東京都" },
		desiredOccupation: {
			occupationSelection: "ソフトウェア開発技術者、プログラマー",
		},
		employmentType: "PartTimeWorker",
	},
});
