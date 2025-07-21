import { OpenAPIRoute, contentJson, fromHono } from "chanfana";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { type Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ResultAsync } from "neverthrow";
import { getDb } from "./db";
import { jobs } from "./db/schema";
import {
  type RequestBody,
  clientErrorResponse,
  requestBodySchema,
  serverErrorResponse,
  successResponseSchema,
} from "./schema";

export type Env = {
  // Example bindings, use your own
  DB: D1Database;
};
export type AppContext = Context<{ Bindings: Env }>;

class JobInsertEndpoint extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        ...contentJson(requestBodySchema),
      },
    },
    responses: {
      "200": {
        description: "Successful response",
        ...contentJson(successResponseSchema),
      },
      "400": {
        description: "client error response",
        ...contentJson(clientErrorResponse),
      },
      "500": {
        description: "internal server error response",
        ...contentJson(serverErrorResponse),
      },
    },
  };

  async handle(c: AppContext) {
    const db = getDb(c);
    const client = buildClient(db);
    const result = ResultAsync.fromPromise(
      this.getValidatedData<typeof this.schema>(),
      (e) =>
        ({
          type: "ValidateError",
          message: `schema validateion failed.\n${String(e)}`,
        }) as const,
    ).andThen(({ body }) => client.insertJob(body));
    return result.match(
      (job) => c.json({ success: true, result: { job } }, 200),
      (e) => {
        console.error(e);
        switch (e.type) {
          case "ValidateError":
            throw new HTTPException(400, { message: "invalid req body" });
          case "InsertJobError":
            throw new HTTPException(500, { message: "internal server error" });
          default:
            throw new HTTPException(500, { message: "internal server error" });
        }
      },
    );
  }
}
const app = new Hono<{ Bindings: Env }>();

// Initialize Chanfana for Hono
const openapi = fromHono(app, {
  base: "/api/v1",
  schema: {
    info: {
      title: "Job Store API",
      version: "1.0.0",
      description: "This is the documentation for job store API.",
    },
    servers: [
      // { url: 'http://localhost:3000/api/v1', description: 'Development server' },
    ],
  },
  docs_url: "/api/v1/docs",
  openapi_url: "/api/v1/openapi.json",
  openapiVersion: "3.1", // or '3' for OpenAPI v3.0.3
});
app.get("/", (c) => {
  return c.redirect("/api/v1/docs", 302); // 302 Found でリダイレクト
});
openapi.post("/job", JobInsertEndpoint);

const buildClient = (
  db: DrizzleD1Database<Record<string, never>> & {
    $client: D1Database;
  },
) => {
  return {
    insertJob: (job: RequestBody) => {
      const now = new Date();
      const insertingValues = {
        ...job,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        status: "active",
      };
      console.log(
        `inserting values.\nvalues=${JSON.stringify(insertingValues, null, 2)}`,
      );
      return ResultAsync.fromPromise(
        db.insert(jobs).values(insertingValues),
        (e) => {
          return {
            type: "InsertJobError",
            message: `insert job failed.\n${String(e)}`,
          } as const;
        },
      ).map(() => insertingValues);
    },
  };
};

export { app };
