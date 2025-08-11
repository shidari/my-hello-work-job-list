import { fromHono } from "chanfana";
import { type Context, Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { JobFetchEndpoint } from "./endpoint/jobFetch";
import { JobInsertEndpoint } from "./endpoint/jobInsert/jobInsert";
import { JobListEndpoint } from "./endpoint/jobList/jobList";

const j = Symbol();
type JWTSecret = string & { [j]: unknown };

export type Env = {
  DB: D1Database;
  JWT_SECRET: JWTSecret;
};
export type AppContext = Context<{ Bindings: Env }>;

const app = new Hono<{ Bindings: Env }>();

function getClientKey(c: Context): string {
  // CloudflareのIPヘッダー（最優先）
  const cfIP = c.req.header("CF-Connecting-IP");
  if (cfIP) return cfIP;

  // フォールバック
  const xForwardedFor = c.req.header("X-Forwarded-For");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  // フォールバック、5分ごとにキーがリセットされるようになっている
  // これにより、同一IPからのリクエストが5分間隔で制限される
  // ユーザーエージェントを含めて、同じユーザーが同じ時間帯にリクエストを送った場合に制限される
  const userAgent = c.req.header("User-Agent") || "unknown";
  const timeWindow = Math.floor(Date.now() / (5 * 60 * 1000));

  return `fallback:${btoa(userAgent.slice(0, 30))}:${timeWindow}`;
}

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    keyGenerator: (c) => getClientKey(c), // store: ... , // Redis, MemoryStore, etc. See below.
  }),
);

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

export { app };
