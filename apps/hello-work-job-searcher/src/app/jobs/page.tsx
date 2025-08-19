export const dynamic = "force-dynamic";

import { Accordion } from "../components/client/Accordion";
import { JobOverviewList } from "../components/client/JobOverViewList";
import { JobsSearchfilter } from "../components/client/JobsSearchfilter/index";
import { JobtotalCount } from "../components/client/JobTotalCount";
import { jobStoreClientOnServer } from "../store/server";
import styles from "./page.module.css";

export default async function Page() {
  // 一旦対応めんどいからunsafeUnwrapを使う
  const data = (await jobStoreClientOnServer.getInitialJobs())._unsafeUnwrap();
  return (
    <main className={styles.mainSection}>
      <div className={styles.layoutContainer}>
        <div className={styles.headerSection}>
          <h1>求人情報一覧</h1>
          <JobtotalCount initialDataFromServer={data.meta.totalCount} />
          <Accordion title="絞り込み">
            <JobsSearchfilter />
          </Accordion>
        </div>
        <div className={styles.listSection}>
          <JobOverviewList
            initialDataFromServer={{
              jobs: data.jobs,
              nextToken: data.nextToken,
              totalCount: data.meta.totalCount,
            }}
          />
        </div>
      </div>
    </main>
  );
}
