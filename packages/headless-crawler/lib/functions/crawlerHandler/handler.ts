import type { EventBridgeEvent, Handler } from "aws-lambda";
import { Effect, Exit } from "effect";
import { crawlerRunnable } from "../../domains/crawler";

export const handler: Handler<
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  EventBridgeEvent<"Scheduled Event", {}>,
  void
> = async (event) => {
  console.log("Scheduled event triggered");
  const exit = await Effect.runPromiseExit(crawlerRunnable);
  if (Exit.isSuccess(exit)) {
    console.log("Crawler succeeded:", exit.value);
  } else {
    console.error("Crawler failed:", exit.cause);
  }
  return;
};
