import { Effect } from "effect";
import { GetOriginError, ResolveURLError } from "./error";

export function delay(ms: number) {
  return Effect.promise<void>(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, ms);
      }),
  );
}
