import Link from "next/link";
import { FlexN } from "./Flex";
import "./index.css";
import type { TJobDetail, TJobOverview } from "@sho/models";

export function JobOverview({
  companyName,
  jobTitle,
  employmentType,
  workPlace,
}: TJobOverview) {
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

export function JobOverviewList({ items }: { items: TJobOverview[] }) {
  return (
    <div className="job-overview-list">
      {items.map(
        (
          { companyName, jobTitle, employmentType, workPlace, jobNumber },
          i,
        ) => {
          return (
            <FlexN n={(1 / items.length) * 10} key={i.toString()}>
              <section className="job-overview">
                <Link href={`/jobs/${jobNumber}`}>
                  <JobOverview
                    jobNumber={jobNumber}
                    companyName={companyName}
                    jobTitle={jobTitle}
                    employmentType={employmentType}
                    workPlace={workPlace}
                  />
                </Link>
              </section>
            </FlexN>
          );
        },
      )}
    </div>
  );
}

export function JobDetail(props: { jobDetail: TJobDetail }) {
  const {
    jobNumber,
    companyName,
    jobTitle,
    employmentType,
    salaly,
    workPlace,
    jobDescription,
    expiryDate,
    workingHours,
    qualifications,
  } = props.jobDetail;
  return (
    <article className="job-detail">
      <h2>求人番号: {jobNumber}</h2>
      <ul>
        <li data-label="company-name" data-value={companyName}>
          企業名: {companyName}
        </li>
        <li data-label="job-title" data-value={jobTitle}>
          職種: {jobTitle}
        </li>
        <li data-label="employment-type" data-value={employmentType}>
          求人区分: {employmentType}
        </li>
        <li data-label="job-description" data-value={jobDescription}>
          職務概要: {jobDescription}
        </li>
        <li data-label="salaly" data-value={salaly}>
          賃金: {salaly}
        </li>
        <li data-label="work-place" data-value={workPlace} />
        就業場所: {workPlace}
        <li data-label="expiry-date" data-value={expiryDate}>
          紹介期限: {expiryDate}
        </li>
        <li data-label="working-hours" data-value={workingHours}>
          勤務時間: {workingHours}
        </li>
        <li
          data-label="qualifications"
          data-value={qualifications || "nothing"}
        >
          必須資格: {qualifications || "nothing"}
        </li>
      </ul>
    </article>
  );
}
