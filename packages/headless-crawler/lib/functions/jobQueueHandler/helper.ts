import {
  type JobInfo,
  type JobNumber,
  ParsedEmploymentCountSchema,
  ParsedExpiryDateSchema,
  ParsedReceivedDateSchema,
  ParsedWageSchema,
  ParsedWorkingHoursSchema,
} from "@sho/schema";
import { Effect, Schema } from "effect";
import {
  ParseEmployeeCountError,
  ParseExpiryDateError,
  ParseReceivedDateError,
  ParseWageError,
  ParsedWorkingHoursError,
  SafeParseEventBodyError,
  ToFirstRecordError,
} from "./error";
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
    const {
      job: { jobNumber },
    } = yield* safeParseEventBody(body);
    return jobNumber as JobNumber;
  });
};

export const job2InsertedJob = (job: JobInfo) => {
  const {
    jobNumber,
    companyName,
    employeeCount: rawEmploreeCount,
    employmentType,
    expiryDate: rawExpiryDate,
    receivedDate: rawReceivedDate,
    homePage,
    wage: rawWage,
    workingHours: rawWorkingHours,
    occupation,
  } = job;
  return Effect.gen(function* () {
    const employeeCount = yield* Effect.try({
      try: () => ParsedEmploymentCountSchema.parse(rawEmploreeCount),
      catch: (e) =>
        new ParseEmployeeCountError({
          message: `parse employee count failed.\n${String(e)}`,
        }),
    });
    const receivedDate = yield* Effect.try({
      try: () => ParsedReceivedDateSchema.parse(rawReceivedDate),
      catch: (e) =>
        new ParseReceivedDateError({
          message: `parse received date failed.\n${String(e)}`,
        }),
    });
    const expiryDate = yield* Effect.try({
      try: () => ParsedExpiryDateSchema.parse(rawExpiryDate),
      catch: (e) =>
        new ParseExpiryDateError({
          message: `parse expiry date failed.\n${String(e)}`,
        }),
    });
    const { wageMax, wageMin } = yield* Effect.try({
      try: () => ParsedWageSchema.parse(rawWage),
      catch: (e) =>
        new ParseWageError({ message: `parse wage failed.\n${String(e)}` }),
    });
    const { workingEndTime, workingStartTime } = yield* Effect.try({
      try: () => ParsedWorkingHoursSchema.parse(rawWorkingHours),
      catch: (e) =>
        new ParsedWorkingHoursError({
          message: `parse working hours failed.\n${String(e)}`,
        }),
    });
    return {
      jobNumber,
      companyName,
      employeeCount,
      employmentType,
      receivedDate,
      expiryDate,
      wageMax,
      wageMin,
      workingEndTime,
      workingStartTime,
      homePage,
      occupation,
    };
  });
};
