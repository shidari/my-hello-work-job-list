import type { Job } from "../api/type";
import { FlexN } from "./Flex";

export function JobOverview({
	companyName,
	jobTitle,
	employmentType,
	workPlace,
}: Job) {
	return (
		<div>
			<h2 data-label="comapny_name">{companyName}</h2>
			<ul>
				<li data-label="job-title" data-value="software_engineer">
					職種: {jobTitle}
				</li>
				<li data-label="employment-type" data-value="part_time">
					求人区分: {employmentType}
				</li>
				<li data-label="work-place" data-value="suginami">
					就業場所: {workPlace}
				</li>
			</ul>
		</div>
	);
}

export function JobOverviewList({ items }: { items: Job[] }) {
	return (
		<div className="job-overview-list">
			{items.map(({ companyName, jobTitle, employmentType, workPlace }, i) => {
				return (
					<FlexN n={(1 / items.length) * 10} key={i.toString()}>
						<section className="job-overview">
							<JobOverview
								companyName={companyName}
								jobTitle={jobTitle}
								employmentType={employmentType}
								workPlace={workPlace}
							/>
						</section>
					</FlexN>
				);
			})}
		</div>
	);
}
