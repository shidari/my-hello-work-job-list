import { fromHono } from "chanfana";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { JobFetch } from "./endpoints/jobFetch";
import { JobInsert } from "./endpoints/jobInsert";
import { JobList } from "./endpoints/jobList";

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();
app.use(logger(customLogger));

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post("/api/jobs", JobInsert);
openapi.get("/api/jobs", JobList);
openapi.get("/api/jobs/:jobNumber", JobFetch);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
