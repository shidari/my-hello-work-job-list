import { jobStoreClient } from "@/app/client";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log("Fetching job data...");
  // NextRequestのsearchParamsを直接使用
  const nextToken = request.nextUrl.searchParams.get("nextToken") ?? undefined;

  const result = await jobStoreClient.getJobs(nextToken);
  return result.match(
    (validatedData) => {
      console.log("Job data fetched successfully:", validatedData);
      return Response.json(validatedData);
    },
    (error) => {
      console.error("Error fetching job data:", error);
      return Response.json(
        { error: "Failed to fetch job data" },
        { status: 500 },
      );
    },
  );
}
