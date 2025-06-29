import { Effect } from "effect";
import { buildScrapingRunner } from "..";

async function main() {
  const jobNumber = "01010-24884551";
  const runnable = buildScrapingRunner(jobNumber);
  Effect.runPromise(runnable).then((jobInfo) =>
    console.dir({ ...jobInfo }, { depth: null }),
  );
}

main();
