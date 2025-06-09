import { FlexN } from "../components";
import { FlexColumn } from "../components/FlexColumn";
import { JobOverviewList } from "../components/Job";

export default function Page() {
	const items = Array.from({ length: 5 }, (_) => ({
		jobNumber: "dummy",
		companyName: "ジャパンカンパニー",
		workPlace: "杉並区",
		jobTitle: "ソフトウェアエンジニア",
		employmentType: "パート",
	}));
	return (
		<main style={{ height: "100%" }}>
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
