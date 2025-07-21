import { defineHelloWorkScrapingConfig } from "./scraper-type";

export default defineHelloWorkScrapingConfig(async () => {
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const chromium = isLambda
    ? await import("@sparticuz/chromium").then((mod) => mod.default)
    : null;
  return {
    browserConfig: {
      args: chromium ? chromium.args : [],
      executablePath: chromium ? await chromium.executablePath() : undefined,
      headless: false,
    },
    debugLog: false,
  };
});
