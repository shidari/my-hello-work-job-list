import type { JobNumber } from "@sho/schema";
import { Effect, Schema } from "effect";
import { SafeParseEventBodyError, ToFirstRecordError } from "./error";
import { jobQueueEventBodySchema } from "./schema";
import type { TsafeParseEventBody, TtoFirstRecord, TtoJobNumber } from "./type";

const safeParseEventBody: TsafeParseEventBody = (val) => {
  const decode = Schema.decodeUnknownSync(jobQueueEventBodySchema);
  return Effect.try({
    try: () => decode(val),
    catch: (e) =>
      new SafeParseEventBodyError({ message: `parse failed. \n${String(e)}` }),
  });
};

const toFirstRecord: TtoFirstRecord = (records) => {
  return Effect.gen(function* () {
    const record = records.at(0);
    if (records.length !== 1)
      return yield* Effect.fail(
        new ToFirstRecordError({
          message: `record count should be 1 but ${records.length}`,
        }),
      );
    if (!record)
      return yield* Effect.fail(
        new ToFirstRecordError({ message: "record is missing" }),
      );
    return record;
  });
};

export const eventToFirstRecordToJobNumber: TtoJobNumber = ({ Records }) => {
  return Effect.gen(function* () {
    const record = yield* toFirstRecord(Records);
    const { body } = record;
    const { jobNumber } = yield* safeParseEventBody(body);
    return jobNumber as JobNumber;
  });
};
