# Hello Work Searcher ポートフォリオ詳細解説

## 概要

Hello Work
Searcherは、ハローワークの求人情報を自動収集・管理・検索できるモノレポ型Webアプリケーションです。クローラー、API/DB、フロントエンドを独立したパッケージとして構成し、クラウドネイティブな設計・TypeScriptによる型設計を徹底しています。

**技術的ハイライト**:
Effect-tsによる関数型プログラミング、型安全性の徹底、サーバーレスアーキテクチャの最適化、モノレポによる効率的な開発体験を実現。

---

## 作成動機・課題設定

ハローワークでソフトウェアエンジニアの求人検索を行う際に直面した以下の課題を技術的に解決することが目標：

- **UI/UX課題**: 画面が見づらく、検索効率が悪い
- **データ品質課題**: 求人の重複が多すぎる
- **検索機能課題**: 従業員数での絞り込みができない、キーワード検索が貧弱
- **情報取得効率**: 手動での求人チェックに時間がかかりすぎる

**解決アプローチ**:
自動化によるデータ収集、構造化されたデータベース設計、モダンなWeb
UIによる検索体験の向上

---

## システム全体設計図

```mermaid
graph TD
  A["headless-crawler (AWS Lambda)"] -->|"求人データ"| B["job-store (Cloudflare Workers)"]
  B -->|"REST API"| C["hello-work-job-searcher (React App)"]
  D["ユーザー"] -->|"Webアクセス"| C
  E["@sho/models"] -->|"型定義・スキーマ"| A
  E -->|"型定義・スキーマ"| B
  E -->|"型定義・スキーマ"| C
```

---

## 技術選定・設計思想

- **Effect-ts採用**: 従来のPromise/async-awaitではなくEffect-tsを選択
  - 結果・エラー・依存を全て型で管理し、ランタイムエラーを削減
  - 複雑なスクレイピング処理を小さな関数に分解しやすい
  - 同期・非同期をイテレータベースで統一的に扱える
  - 学習コストは高いが、習得後はコードの整理性が格段に向上

- **サーバーレス基盤の使い分け**
  - **AWS Lambda**: 重いPlaywright処理、バッチ処理
  - **Cloudflare Workers**: 軽量API、エッジでの高速レスポンス
  - コスト最適化のためクローラー実行頻度を調整

- **モノレポ構成**: pnpm workspaceによるパッケージ間の型共有・開発効率化
- **TypeScript徹底**:
  全パッケージでstrictな型安全性を担保。極力型設計を志向し、DB/API/UI間で型の一貫性を保つ。
- **自動化**: Biome + Huskyでコミット時のlint、フォーマット、型チェックを自動化
- **モダンツールチェーン**:
  Biome（高速フォーマッター）、Vite（高速ビルド）、TanStack（モダンReact）

---

## パッケージ詳細

### 1. @sho/models

- **役割**: 全パッケージ共通の型定義・スキーマ管理
- **主な技術**: TypeScript, Zod, Drizzle ORM
- **設計ポイント**:
  - 型の一元管理でパッケージ間の整合性担保
  - Zodによるランタイムバリデーション
  - Drizzle ORMによるDB型定義

#### 型安全性統一の具体的課題解決プロセス

**課題**: Drizzle ORM、Zod、TypeScriptの型定義を統一する際の技術的困難

**遭遇した具体的問題**:

1. **データ変換の型不整合**:
   スクレイピングで取得した生データ（例：`"2025年7月23日"`）をDB保存用（ISO8601形式）に変換する際、各段階で異なる型定義が必要
2. **nullable/optional の不一致**:
   Drizzleの`.nullable()`とZodの`.nullable()`、TypeScriptの`| null`の扱いが微妙に異なる
3. **型ブランディングの複雑化**:
   同じstring型でも`jobNumber`と`companyName`を区別したいが、変換処理で型が失われる

**解決プロセス**:

**Step 1: 型変換の段階的設計**

```typescript
// 生データ → 変換済みデータ → DB保存データの3段階で型を定義
export const RawReceivedDateShema = z.string()
  .regex(/^\d{4}年\d{1,2}月\d{1,2}日$/)
  .brand("receivedDate(raw)");

export const transformedReceivedDateSchema = RawReceivedDateShema
  .transform((value) => {
    const dateStr = value.replace("年", "-").replace("月", "-").replace(
      "日",
      "",
    );
    return new Date(dateStr).toISOString();
  })
  .brand<TransformedReceivedDate>();
```

**Step 2: スキーマ継承による型の一貫性確保**

```typescript
// 基本スキーマから派生させることで型の整合性を保つ
export const insertJobRequestBodySchema = ScrapedJobSchema.omit({
  wage: true,
  receivedDate: true,
  workingHours: true,
  employeeCount: true,
}).extend({
  wageMin: z.number(),
  wageMax: z.number(),
  // ... 変換済みフィールド
});
```

**Step 3: 手動での型同期問題の発見と解決**

- **問題発見**:
  DrizzleスキーマとjobSelectSchemaで手動同期が必要で、フィールド追加時に同期漏れが発生
- **解決策**: コメントで明示的に問題を記録し、将来的な自動生成への移行を計画

```typescript
// これ、キーしか型チェック指定なので、かなりfreaky
export const jobSelectSchema = z.object({
  // Drizzleスキーマと手動同期が必要
});
```

**Step 4: Effect-tsとの統合による堅牢なエラーハンドリング**

```typescript
const validatedReqBody = yield * Effect.tryPromise({
  try: () => self.getValidatedData<typeof self.schema>(),
  catch: (e) =>
    new InsertJobRequestValidationError({
      message: `schema validation failed.\n${String(e)}`,
      errorType: "client",
    }),
}).pipe(Effect.map(({ body }) => body));
```

**成果と学習**:

- **型安全性の向上**:
  フィールド名のタイポやnull/undefined関連のランタイムエラーをコンパイル時に検出
- **開発効率の改善**:
  API仕様変更時の影響範囲が明確化され、修正箇所を漏れなく特定可能
- **保守性の向上**: 型定義の一元管理により、仕様変更時の修正箇所を最小化
- **課題の明確化**: 手動同期部分を明示的にコメントで記録し、技術的負債を可視化

**今後の改善計画**:

- Drizzle-Zodの自動生成ツール導入検討
- 型ブランディングのより効率的な管理手法の研究

### 2. headless-crawler

- **役割**: ハローワーク求人情報の自動クローリング・スクレイピング
- **主な技術**: Playwright, AWS Lambda, AWS CDK, Effect-ts, Jest
- **設計ポイント**:
  - スクレイピング対象の動的ページに対応
  - AWS Lambdaでのスケーラブルなバッチ処理
  - スキーマバリデーションでデータ品質担保
- **技術的課題と解決策**:
  - **セッション管理の問題**:
    最初はCloudflareで軽量なパーサーを使ってクローリングしようとしたが、ハローワークはセッションの関係でfetchができず、headless-browser（Playwright）での実装が必要
  - **2段階処理の実装**:
    クローリングでまず求人番号のみを取得し、SQS経由でスクレイパーを呼び出す設計。セッション維持のため、スクレイピング時も改めてheadless-browserを立ち上げて求人詳細画面まで遷移
  - **レート制限対応**:
    ページングが早すぎるとエラーになるため、ページ遷移前に3秒遅延を実装
- **現在の処理能力**:
  約20件の求人データを処理（コスト最適化のため実行頻度を調整）
- **エラーハンドリング**: Effect-tsのリトライAPIを活用予定（現在は未実装）
- **工夫点**:
  - SQS連携による非同期ジョブ投入
  - AWS CDKによるインフラコード管理

### 3. job-store

- **役割**: 求人情報の保存・API提供
- **主な技術**: Cloudflare Workers, Drizzle ORM, Hono, D1(SQLite), Chanfana,
  Effect-ts, Vitest
- **設計ポイント**:
  - サーバーレスで低コスト・高可用性
  - Drizzle ORMで型安全なDB操作
  - Chanfanaによる自動OpenAPI生成でAPI仕様の一元管理
  - HonoによるモダンなWebフレームワーク
- **現状の機能**:
  - 求人情報の保存・取得API
  - JWTベースのページネーション機能
  - RESTful API提供（求人一覧・詳細取得）
  - OpenAPI仕様書自動生成
- **工夫点**:
  - drizzleでDBスキーマの型を持ち、openapiと整合性を常に持たせたかった
  - Cloudflare D1の制約を考慮した設計
  - Effect-tsによる堅牢なエラーハンドリング
  - JWTを使用したセキュアなページネーション実装

### 4. hello-work-job-searcher (apps/)

- **役割**: 求人情報の検索・表示UI
- **主な技術**: React 19, TanStack Router, TanStack Start, Vite, TypeScript,
  Cloudflare Workers
- **設計ポイント**:
  - TanStack Startによるフルスタックフレームワーク
  - TanStack Routerによるタイプセーフなルーティング
  - React 19の最新機能活用
  - Cloudflare Workersへのデプロイ対応
- **現在の状況**:
  - モックデータを使用した基本的な表示機能
  - UIは未完成（バックエンド構築を優先中）
  - 求人検索・表示の基本機能を実装中
- **工夫点**:
  - Job詳細・一覧の再利用可能なコンポーネント設計
  - Next.jsは小さなWebアプリとしては不必要な機能が多く、RemixはReact
    19との相性を考慮し、TanStack Startを選択
  - ファイルベースルーティングとReact 19の最新機能を活用
  - クラウドAPIとの疎結合

### 5. scripts

- **役割**: 共通スクリプト・ユーティリティ
- **主な技術**: TypeScript, tsup
- **機能**: スキーマコピー等の開発支援スクリプト

---

## データフロー詳細

1. **クローリング**: headless-crawlerがハローワークWebから求人データを取得
2. **データ送信**: AWS LambdaからCloudflare Workers(job-store)へREST APIで送信
3. **保存**: job-storeがD1(SQLite)にデータを保存
4. **API提供**:
   hello-work-job-searcherがjob-storeのAPIを叩き、求人情報を取得・表示（実装中）

---

## 開発環境・ツールチェーン

### パッケージ管理

- **pnpm workspace**: モノレポ管理、高速インストール
- **依存関係の最適化**: 共通依存関係の重複排除

### 開発ツール

- **Biome**: 高速なlinter・formatter（ESLint + Prettierの代替）
- **Husky + lint-staged**: Git hooks による自動品質チェック
- **TypeScript**: 全パッケージで厳密な型チェック
- **Renovate**: 依存関係の自動更新

### テスト・品質管理

- **Jest**: headless-crawlerのテスト
- **Vitest**: job-storeのテスト
- **型チェック**: 全パッケージでの厳密な型安全性
- **テスト戦略の現状**:
  - 現在はテストカバレッジが低い状態
  - REST APIのモックテストは設定に対する利益が少ないと判断し未実装
  - 型安全性を重視し、コンパイル時チェックに依存

### セキュリティ・運用

- **API認証**: 現在はエンドポイント未公開のため未実装
- **今後の認証戦略**:
  - Rate Limitingの実装
  - フロントエンドからのみアクセス可能なドメイン制限
- **監視・ログ戦略**:
  - ポートフォリオレベルでの軽量な監視
  - GitHub Actionsによる定期的な監視実行を検討

---

## 設計思想・工夫点まとめ

### 型安全性の徹底

- **@sho/models**: 全パッケージ共通の型定義
- **Zod/Chanfana/Drizzle**: スキーマ駆動開発による型の一貫性担保
- **TypeScript strict mode**: 全パッケージで厳密な型チェック

### スケーラビリティ・運用性

- **サーバーレスアーキテクチャ**: AWS Lambda + Cloudflare Workersでコスト最適化
- **インフラコード管理**: AWS CDKによるIaC
- **自動化**: CI/CDパイプライン、依存関係更新の自動化

### 開発体験の向上

- **モノレポ**: パッケージ間の依存管理・型共有
- **モダンツールチェーン**: Biome、Vite、TanStackによる高速開発
- **関数型プログラミング**: Effect-tsによる副作用管理・エラーハンドリング

### 今後の展望

- **フロントエンド完成**: job-store APIとの連携、UI/UX強化
- **高度な検索機能**: より柔軟な求人検索・フィルタリング
- **パフォーマンス最適化**: キャッシュ戦略、レスポンス時間改善
- **監視・ログ**: 本格運用に向けた監視体制構築

---

## 参考: ディレクトリ構成

```
hello-work-searcher/
├── apps/
│   └── hello-work-job-searcher/ # フロントエンドアプリケーション
├── packages/
│   ├── models/          # 共通スキーマ・型定義
│   ├── headless-crawler/ # ハローワーククローラー
│   ├── job-store/       # 求人情報データベース・API
│   └── scripts/         # 共通スクリプト
├── pnpm-workspace.yaml # モノレポ設定
├── biome.json          # コードフォーマッター設定
├── renovate.json       # 依存関係自動更新設定
└── README.md           # プロジェクト概要
```

---

## 技術的チャレンジ・学習ポイント

### 1. モノレポ設計

- pnpm workspaceによる効率的なパッケージ管理
- 型定義の共有とパッケージ間依存関係の最適化

### 2. サーバーレスアーキテクチャ

- AWS Lambda + Cloudflare Workersのハイブリッド構成
- 各プラットフォームの特性を活かした適材適所の技術選択

### 3. 型安全性の追求

- フロントエンド〜バックエンド〜DBまでの一貫した型管理
- ランタイムバリデーションとコンパイル時型チェックの両立

### 4. モダンフロントエンド

- React 19 + TanStack Startによる最新技術スタックの採用
- ファイルベースルーティングとタイプセーフなナビゲーション

### 5. 関数型プログラミング

- Effect-tsによる副作用管理と堅牢なエラーハンドリング
- 関数型パラダイムによるコードの可読性・保守性向上
