import type { SQSEvent, SQSHandler } from "aws-lambda";
import { Effect, Exit } from "effect";
import { buildScrapingRunner } from "../../domains/scraper";
import { eventToFirstRecordToJobNumber } from "./helper";

export const handler: SQSHandler = async (event: SQSEvent) => {
  const effect = Effect.gen(function* () {
    const jobNumber = yield* eventToFirstRecordToJobNumber(event);
    const runner = yield* buildScrapingRunner(jobNumber);
    return runner;
  });
  const result = await Effect.runPromiseExit(effect);

  if (Exit.isSuccess(result)) {
    console.log("Lambda job succeeded:", result.value);
  } else {
    console.error("Lambda job failed", result.cause);
  }
};
