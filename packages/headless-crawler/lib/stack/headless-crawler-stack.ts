import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";

export class HeadlessCrawlerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    const queue = new sqs.Queue(this, "ScrapingJobQueue", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    const playwrightLayer = new lambda.LayerVersion(this, "playwrightLayer", {
      code: lambda.Code.fromAsset("lib/functions/layer/playwright.zip"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
    });

    const scraper = new NodejsFunction(this, "ScrapingFunction", {
      entry: "lib/functions/jobQueueHandler/handler.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 1024,
      timeout: Duration.seconds(15),
      layers: [playwrightLayer],
      bundling: {
        externalModules: [
          "chromium-bidi/lib/cjs/bidiMapper/BidiMapper",
          "chromium-bidi/lib/cjs/cdp/CdpConnection",
          "@sparticuz/chromium",
          "./chromium/appIcon.png",
          "./loader",
          "playwright-core",
        ], // Layer に含めるモジュールは除外
      },
    });

    scraper.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 1,
      }),
    );
  }
}
