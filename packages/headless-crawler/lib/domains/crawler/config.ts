import type { HelloWorkCrawlingConfig } from "./type";

export async function defineHelloWorkCrawlingConfig(
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
