import { fromHono } from "chanfana";
import { type Context, Hono } from "hono";
import { JobFetchEndpoint } from "./endpoint/jobFetch";
import { JobInsertEndpoint } from "./endpoint/jobInsert/jobInsert";
import { JobListEndpoint } from "./endpoint/jobList";
import { JobListContinueEndpoint } from "./endpoint/jobList/continue";

const j = Symbol();
type JWTSecret = string & { [j]: unknown };

export type Env = {
  DB: D1Database;
  JWT_SECRET: JWTSecret;
};
export type AppContext = Context<{ Bindings: Env }>;

const app = new Hono<{ Bindings: Env }>();

// シンプルなログミドルウェア
app.use("*", async (c, next) => {
  const start = Date.now();

  console.log(`📥 ${c.req.method} ${c.req.url}`);

  await next();

  const duration = Date.now() - start;
  console.log(`📤 ${c.res.status} (${duration}ms)`);
});

// Initialize Chanfana for Hono
const openapi = fromHono(app, {
  schema: {
    info: {
      title: "Job Store API",
      version: "1.0.0",
      description: "This is the documentation for job store API.",
    },
    servers: [],
  },
  docs_url: "/api/v1/docs",
  openapi_url: "/api/v1/openapi.json",
  openapiVersion: "3.1",
});

app.get("/", (c) => {
  return c.redirect("/api/v1/docs", 302);
});

openapi.post("/api/v1/job", JobInsertEndpoint);
openapi.get("/api/v1/job/:jobNumber", JobFetchEndpoint);
openapi.get("/api/v1/jobs", JobListEndpoint);
openapi.get("/api/v1/jobs/continue", JobListContinueEndpoint);

export { app };
