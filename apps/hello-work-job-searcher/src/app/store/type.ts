import type { jobListSuccessResponseSchema, SearchFilter } from "@sho/models";
import type { ResultAsync } from "neverthrow";

/**
 * 求人ストアクライアントの共通インターフェース
 */
export interface JobStoreClient {
  /**
   * 初期求人リスト取得
   * @param filter 検索フィルター
   */
  getInitialJobs(
    filter?: SearchFilter,
  ): ResultAsync<ReturnType<typeof jobListSuccessResponseSchema.parse>, Error>;

  /**
   * 続きの求人リスト取得
   * @param nextToken ページネーション用トークン
   */
  getContinuedJobs(
    nextToken: string,
  ): ResultAsync<ReturnType<typeof jobListSuccessResponseSchema.parse>, Error>;
}
