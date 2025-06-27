import type { HelloWorkCrawlingConfig } from "./crawler-type";
export default defineHelloWorkCrawlingConfig(async () => {
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const chromium = isLambda
    ? await import("@sparticuz/chromium").then((mod) => mod.default)
    : null;
  return {
    roughMaxCount: 100,
    browserConfig: {
      executablePath: chromium ? await chromium.executablePath() : undefined,
      args: chromium ? chromium.args : [],
    },
    nextPageDelayMs: 3000,
    debugLog: true,
    jobSearchCriteria: {
      workLocation: { prefecture: "東京都" },
      desiredOccupation: {
        occupationSelection: "ソフトウェア開発技術者、プログラマー",
      },
      employmentType: "PartTimeWorker",
    },
  };
});

async function defineHelloWorkCrawlingConfig(
  config:
    | HelloWorkCrawlingConfig
    | Promise<HelloWorkCrawlingConfig>
    | (() => HelloWorkCrawlingConfig)
    | (() => Promise<HelloWorkCrawlingConfig>),
): Promise<HelloWorkCrawlingConfig> {
  if (typeof config === "function") {
    return await config();
  }
  return await config;
}
