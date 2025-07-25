import {
  type InsertJobRequestBody,
  type JobNumber,
  type ScrapedJob,
  insertJobSuccessResponseSchema,
  transformedEmployeeCountSchema,
  transformedExpiryDateSchema,
  transformedReceivedDateSchema,
} from "@sho/schema";
import { transformedWageSchema } from "@sho/schema";
import { transformedWorkingHoursSchema } from "@sho/schema";
import { Effect, Schema } from "effect";
import {
  GetEndPointError,
  InsertJobError,
  InsertJobSuccessResponseValidationError,
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

export const job2InsertedJob = (job: ScrapedJob) => {
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
    workPlace,
    jobDescription,
    qualifications,
  } = job;
  return Effect.gen(function* () {
    const employeeCount = yield* Effect.try({
      try: () => transformedEmployeeCountSchema.parse(rawEmploreeCount),
      catch: (e) =>
        new ParseEmployeeCountError({
          message: `parse employee count failed.\n${String(e)}`,
        }),
    });
    const receivedDate = yield* Effect.try({
      try: () => transformedReceivedDateSchema.parse(rawReceivedDate),
      catch: (e) =>
        new ParseReceivedDateError({
          message: `parse received date failed.\n${String(e)}`,
        }),
    });
    const expiryDate = yield* Effect.try({
      try: () => transformedExpiryDateSchema.parse(rawExpiryDate),
      catch: (e) =>
        new ParseExpiryDateError({
          message: `parse expiry date failed.\n${String(e)}`,
        }),
    });
    const { wageMax, wageMin } = yield* Effect.try({
      try: () => transformedWageSchema.parse(rawWage),
      catch: (e) =>
        new ParseWageError({ message: `parse wage failed.\n${String(e)}` }),
    });
    const { workingEndTime, workingStartTime } = yield* Effect.try({
      try: () => transformedWorkingHoursSchema.parse(rawWorkingHours),
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
      workPlace,
      jobDescription,
      qualifications,
    } satisfies InsertJobRequestBody;
  });
};

const getEndPoint = () => {
  const endpoint = process.env.JOB_STORE_ENDPOINT;
  if (!endpoint)
    return Effect.fail(
      new GetEndPointError({
        message: `cannot get endpoint. endpoint=${endpoint}`,
      }),
    );
  return Effect.succeed(endpoint);
};

export function buildJobStoreClient() {
  return Effect.gen(function* () {
    const endpoint = yield* getEndPoint();
    return {
      insertJob: (job: InsertJobRequestBody) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(
            `executing insert job api. job=${JSON.stringify(job, null, 2)}`,
          );
          const res = yield* Effect.tryPromise({
            try: async () =>
              fetch(`${endpoint}/job`, {
                method: "POST",
                body: JSON.stringify(job),
                headers: { "content-type": "application/json" },
              }),
            catch: (e) =>
              new InsertJobError({
                message: `insert job response failed.\n${String(e)}`,
              }),
          });
          if (!res.ok) {
            throw new InsertJobError({
              message: `insert job failed.\nstatus=${res.status}\nstatusText=${res.statusText}`,
            });
          }
          const data = yield* Effect.tryPromise({
            try: () => res.json(),
            catch: (e) =>
              new InsertJobError({
                message: `insert job transforming json failed.\n${String(e)}`,
              }),
          });
          yield* Effect.logDebug(
            `response data. ${JSON.stringify(data, null, 2)}`,
          );
          const validated = yield* validateInsertJobSuccessResponse(data);
          return validated;
        }),
    };
  });
}

export function validateInsertJobSuccessResponse(val: unknown) {
  return Effect.try({
    try: () => {
      insertJobSuccessResponseSchema.parse(val);
    },
    catch: (e) =>
      new InsertJobSuccessResponseValidationError({
        message: `validate inserted job success response error.\n${String(e)}`,
      }),
  });
}
