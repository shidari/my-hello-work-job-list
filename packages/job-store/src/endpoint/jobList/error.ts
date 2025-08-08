// エラー型定義
export type JWTDecodeError = {
  readonly _tag: "JWTDecodeError";
  readonly message: string;
};

export type JWTSignatureError = {
  readonly _tag: "JWTSignatureError";
  readonly message: string;
};

export type JWTExpiredError = {
  readonly _tag: "JWTExpiredError";
  readonly message: string;
};

export type DecodeJWTPayloadError = {
  readonly _tag: "DecodeJWTPayloadError";
  readonly message: string;
};

export type FetchJobListValidationError = {
  readonly _tag: "FetchJobListValidationError";
  readonly message: string;
};

// エラーファクトリ関数
export const createJWTDecodeError = (message: string): JWTDecodeError => ({
  _tag: "JWTDecodeError",
  message,
});

export const createJWTSignatureError = (
  message: string,
): JWTSignatureError => ({
  _tag: "JWTSignatureError",
  message,
});

export const createJWTExpiredError = (message: string): JWTExpiredError => ({
  _tag: "JWTExpiredError",
  message,
});

export const createDecodeJWTPayloadError = (
  message: string,
): DecodeJWTPayloadError => ({
  _tag: "DecodeJWTPayloadError",
  message,
});

export const createFetchJobListValidationError = (
  message: string,
): FetchJobListValidationError => ({
  _tag: "FetchJobListValidationError",
  message,
});
