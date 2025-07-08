import type { EventBridgeEvent, Handler } from "aws-lambda";
import { Effect, Exit, pipe } from "effect";
import { crawlerRunnable } from "../../domains/crawler";
import { sendJobToQueue } from "./helper";

export const handler: Handler<
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  EventBridgeEvent<"Scheduled Event", {}>,
  void
> = async (event) => {
  const program = pipe(
    crawlerRunnable,
    Effect.flatMap((jobs) => Effect.forEach(jobs, sendJobToQueue)),
  );

  const exit = await Effect.runPromiseExit(program);
  if (Exit.isSuccess(exit)) {
    console.log("handler succeeded", JSON.stringify(exit.value, null, 2));
  } else {
    throw new Error(`handler failed: ${exit.cause}`);
  }
};
