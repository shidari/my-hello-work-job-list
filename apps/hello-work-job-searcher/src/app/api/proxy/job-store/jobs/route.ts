import { jobListSuccessResponseSchema } from "@sho/models";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching job data...");
    // NextRequestのsearchParamsを直接使用
    const nextToken = request.nextUrl.searchParams.get("nextToken");

    const endpoint = process.env.JOB_STORE_ENDPOINT;
    console.log({ endpoint });
    if (!endpoint) {
      return Response.json(
        { error: "JOB_STORE_ENDPOINT is not defined" },
        { status: 500 },
      );
    }

    const url = nextToken
      ? `${endpoint}/jobs?nextToken=${nextToken}`
      : `${endpoint}/jobs`;

    const response = await fetch(url);
    const data = await response.json();
    const validatedData = jobListSuccessResponseSchema.parse(data);
    return Response.json(validatedData);
    // ...rest of the code
  } catch (error) {
    // ...
    console.error("Error fetching job data:", error);
    return Response.json(
      { error: "Failed to fetch job data" },
      { status: 500 },
    );
  }
}
