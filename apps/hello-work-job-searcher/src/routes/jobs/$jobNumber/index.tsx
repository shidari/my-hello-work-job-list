import type { TJobDetail } from "@sho/schema";
import { createFileRoute } from "@tanstack/react-router";
import { FlexColumn, FlexN } from "~/components";
import { JobDetail } from "~/components/Job";

export const Route = createFileRoute("/jobs/$jobNumber/")({
  component: Page,
});
export default function Page() {
  const dummyJobDetail: TJobDetail = {
    jobNumber: "24010-06782951",
    companyName: "株式会社ジャパロジ",
    jobTitle: "銀行システム運用・保守",
    salaly: "月給 350,000円〜500,000円",
    employmentType: "正社員以外",
    workPlace: "愛媛県松山市高砂町２丁目２－５",
    jobDescription:
      "金融機関の次期基幹システム更改に伴うデータ移行やパッチ処理の設計・開発業務（COBOL、PLI、ASM）。",
    expiryDate: "2025-07-31",
    workingHours: "09:00〜18:00（休憩60分）",
    qualifications: "COBOLまたはPLIの経験、客先常駐経験があれば尚可",
  };
  return (
    <main>
      <FlexColumn>
        <FlexN n={1}>
          <h1>求人情報一覧</h1>
        </FlexN>
        <FlexN n={9}>
          <JobDetail jobDetail={dummyJobDetail} />
        </FlexN>
      </FlexColumn>
    </main>
  );
}
