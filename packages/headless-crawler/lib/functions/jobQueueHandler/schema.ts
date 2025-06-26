import { Schema } from "effect";
export const jobQueueEventBodySchema = Schema.parseJson(
  Schema.Struct({ jobNumber: Schema.String }),
);
