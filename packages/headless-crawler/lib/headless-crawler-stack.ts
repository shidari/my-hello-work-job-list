import path from "node:path";
import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";

export class HeadlessCrawlerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'HeadlessCrawlerQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const playwrightLayer = new lambda.LayerVersion(this, "PlaywrightLayer", {
      code: lambda.Code.fromAsset("lib/layer/playwright-layer.zip"), // playwrightやchromiumバイナリ入れたディレクトリ
      description: "Layer with Playwright and Chromium",
    });

    const crawler = new NodejsFunction(this, "headless-crawler", {
      entry: path.resolve("lib/lambda/handler/index.ts"), // ソースファイル
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 1024,
      timeout: Duration.seconds(30),
      layers: [playwrightLayer],
      environment: {
        PLAYWRIGHT_BROWSERS_PATH:
          "/opt/nodejs/node_modules/playwright-core/.local-browsers",
      },
      bundling: {
        externalModules: ["playwright-core"], // Layer に含めるモジュールは除外
      },
    });
  }
}
