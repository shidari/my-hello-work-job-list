import { FlexN } from "../components";
import { FlexColumn } from "../components/FlexColumn";
import { JobOverviewList } from "../components/Job";

export default function Page() {
	const items = Array.from({ length: 5 }, (_) => ({
		companyName: "ジャパンカンパニー",
		workPlace: "杉並区",
		jobTitle: "ソフトウェアエンジニア",
		employmentType: "パート",
	}));
	return (
		<main>
			<FlexColumn>
				<FlexN n={1}>
					<h1>求人情報一覧</h1>
				</FlexN>
				<FlexN n={9}>
					<JobOverviewList items={items} />
				</FlexN>
			</FlexColumn>
		</main>
	);
}
