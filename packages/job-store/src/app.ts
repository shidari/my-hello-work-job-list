import { fromHono } from "chanfana";
import { type Context, Hono } from "hono";
import { JobInsertEndpoint } from "./endpoint/jobInsert";

export type Env = {
  // Example bindings, use your own
  DB: D1Database;
};
export type AppContext = Context<{ Bindings: Env }>;

const app = new Hono<{ Bindings: Env }>();

// Initialize Chanfana for Hono
const openapi = fromHono(app, {
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
openapi.post("/api/v1/job", JobInsertEndpoint);

export { app };
