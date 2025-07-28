// 🔍 型チェック用ユーティリティ
export type KeysMustMatch<A, B> = Exclude<keyof A, keyof B> extends never
  ? Exclude<keyof B, keyof A> extends never
    ? true
    : ["Extra keys in B:", Exclude<keyof B, keyof A>]
  : ["Extra keys in A:", Exclude<keyof A, keyof B>];
