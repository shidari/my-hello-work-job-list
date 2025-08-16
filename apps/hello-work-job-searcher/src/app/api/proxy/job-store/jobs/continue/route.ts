import type { NextRequest } from "next/server";
import { jobStoreClient } from "@/app/store/server";

export async function GET(request: NextRequest) {
  // NextRequestのsearchParamsを直接使用
  const nextToken = request.nextUrl.searchParams.get("nextToken") ?? undefined;
  if (!nextToken) {
    return Response.json({ error: "Missing nextToken" }, { status: 400 });
  }
  const result = await jobStoreClient.getContinuedJobs(nextToken);
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
