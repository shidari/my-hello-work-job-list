import type { NextRequest } from "next/server";
import { jobStoreClient } from "@/app/client";

export async function GET(request: NextRequest) {
  // NextRequestのsearchParamsを直接使用
  const nextToken = request.nextUrl.searchParams.get("nextToken") ?? undefined;
  const companyName =
    request.nextUrl.searchParams.get("companyName") ?? undefined;
  const result = await jobStoreClient.getJobs(
    nextToken,
    companyName ? { companyName } : {},
  );
  return result.match(
    (validatedData) => {
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
