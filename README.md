# Hello Work Searcher

求人情報の自動収集・管理システム

**🌐 デモサイト**: https://my-hello-work-job-list-hello-work-j.vercel.app/

## 概要

このプロジェクトは、ハローワークの求人情報を自動的にクロール・スクレイピングし、管理・検索できるシステムです。モノレポ構成で、フロントエンド、データベース・API、クローラーなどの各機能を独立したパッケージとして管理しています。

## アーキテクチャ

### 全体構成

```
hello-work-searcher/
├── apps/
│   └── hello-work-job-searcher/ # フロントエンドアプリケーション (Next.js 15)
├── packages/
│   ├── models/          # 共通スキーマ・型定義 (@sho/models)
│   ├── headless-crawler/ # ハローワーククローラー (AWS Lambda)
│   ├── job-store/       # 求人情報データベース・API (Cloudflare Workers)
│   └── scripts/         # 共通スクリプト・ユーティリティ (@sho/scripts)
├── pnpm-workspace.yaml # モノレポ設定
├── biome.json         # コードフォーマッター設定
└── renovate.json      # 依存関係自動更新設定
```

### データフロー

```mermaid
graph TD
  A["headless-crawler (AWS Lambda)"] -->|"求人データ"| B["job-store (Cloudflare Workers)"]
  B -->|"REST API"| C["hello-work-job-searcher (Next.js)"]
  D["ユーザー"] -->|"Webアクセス"| C
  E["@sho/models"] -->|"型定義・スキーマ"| A
  E -->|"型定義・スキーマ"| B
  E -->|"型定義・スキーマ"| C
```

### 技術スタック

#### 共通

- **パッケージマネージャー**: pnpm (v10.14.0)
- **言語**: TypeScript
- **コードフォーマッター**: Biome (v2.0.6)
- **Git Hooks**: Husky + lint-staged
- **依存関係管理**: Renovate

#### 各パッケージ

##### `@sho/models`

- **目的**: 共通の型定義とスキーマ
- **技術**:
  - Zod (v3.25.74) - スキーマバリデーション
  - Drizzle ORM (v0.44.2) - データベーススキーマ
  - TypeScript (v5.8.3) - 型定義
  - tsup (v8.5.0) - ビルドツール
  - Playwright (v1.53.1) - テスト用ブラウザ自動化

##### `headless-crawler`

- **目的**: ハローワークサイトのクローリング・スクレイピング
- **技術**:
  - Playwright (v1.53.1) - ブラウザ自動化
  - AWS CDK (v2.1022.0) - インフラ管理
  - Effect (v3.16.5) - 関数型プログラミング
  - Jest (v29.7.0) - テスト
  - AWS Lambda + SQS - 実行環境
  - @sparticuz/chromium (v138.0.0) - Lambda用Chromium
- **機能**:
  - 求人検索条件に基づく求人一覧取得
  - 個別求人詳細情報のスクレイピング
  - SQS連携による非同期ジョブ処理
  - EventBridge (Cron) による定期実行（毎週月曜日午前1時）
  - CloudWatch アラーム機能付き

##### `job-store`

- **目的**: 求人情報のデータベース管理・API提供
- **技術**:
  - Cloudflare Workers - 実行環境
  - Drizzle ORM (v0.44.2) - データベースORM
  - Hono (v4.8.3) - Webフレームワーク
  - D1 (SQLite) - データベース
  - Chanfana (v2.8.1) - OpenAPI生成
  - Vitest (v3.2.0) - テスト
  - Zod (v3.25.74) - バリデーション
  - neverthrow (v8.2.0) - エラーハンドリング
  - Wrangler (v4.26.1) - デプロイメントツール
  - tsup (v8.5.0) - ビルドツール
- **機能**:
  - 求人情報の保存・取得
  - JWTベースのページネーション機能
  - RESTful API提供（求人一覧・詳細取得）
  - OpenAPI仕様書自動生成 (`/api/v1/docs`)
  - ルートパスから自動的にドキュメントページへリダイレクト
  - 3つのエンドポイント:
    - `POST /api/v1/job` - 求人情報登録
    - `GET /api/v1/job/:jobNumber` - 求人詳細取得
    - `GET /api/v1/jobs` - 求人一覧取得

##### `hello-work-job-searcher`

- **目的**: ユーザーインターフェース
- **技術**:
  - React (v19.1.1)
  - Next.js (v15.4.6) - App Router
  - TypeScript (v5)
  - Turbopack - 開発時高速化
  - TanStack React Query (v5.84.1) - データフェッチング
  - TanStack React Virtual (v3.13.12) - 仮想化
  - neverthrow (v8.2.0) - エラーハンドリング
- **デプロイ**: Vercel
- **現在の状況**:
  - job-store APIとの連携完了
  - 求人一覧表示機能実装済み
  - プロキシAPI (`/api/proxy/job-store/jobs`) 実装済み
  - 無限スクロール対応の求人一覧表示
  - 求人詳細ページ (`/jobs/[jobNumber]`) 実装済み
  - ホームページから求人一覧への自動リダイレクト実装済み

##### `@sho/scripts`

- **目的**: 共通スクリプト・ユーティリティ
- **技術**:
  - TypeScript (v5.8.3)
  - fs-extra (v11.3.0) - ファイル操作
  - neverthrow (v8.2.0) - エラーハンドリング
  - find-up (v7.0.0) - ファイル検索
- **機能**:
  - スキーマコピー等の開発支援スクリプト (`copy-schema`)

## 開発環境セットアップ

### 前提条件

- Node.js (推奨: 最新LTS版)
- pnpm (v10.14.0以上)
- AWS CLI (headless-crawler使用時)
- Cloudflare Wrangler (job-store使用時)

### インストール

```bash
# 依存関係のインストール
pnpm install

# 型チェック
pnpm type-check

# コードフォーマット
pnpm exec biome check --fix
```

### 各パッケージの開発

#### フロントエンド

```bash
cd apps/hello-work-job-searcher
pnpm dev  # http://localhost:9002 で起動
```

#### クローラー

```bash
cd packages/headless-crawler
pnpm verify:crawler  # クローラー動作確認
pnpm verify:scraper  # スクレイパー動作確認
pnpm type-check      # 型チェック
pnpm test           # テスト実行
```

#### データベース・API

```bash
cd packages/job-store
pnpm dev      # ローカル開発サーバー
pnpm test     # テスト実行
pnpm build    # ビルド
```

#### 共通モデル

```bash
cd packages/models
pnpm build    # 型定義・スキーマのビルド
```

## デプロイ

### クローラー (AWS)

```bash
cd packages/headless-crawler
pnpm bootstrap      # 初回のみ（CDK Bootstrap）
pnpm deploy         # AWS Lambda + SQSにデプロイ
```

### データベース・API (Cloudflare)

```bash
cd packages/job-store
pnpm deploy         # Cloudflare Workersにデプロイ
```

### フロントエンド (Vercel)

```bash
cd apps/hello-work-job-searcher
pnpm build
pnpm start          # 本番環境での起動確認
```

**デプロイ済みURL**: https://my-hello-work-job-list-hello-work-j.vercel.app/

## 主要機能

### 完成済み

- ✅ 求人検索条件に基づく自動クローリング
- ✅ 求人詳細情報の自動スクレイピング
- ✅ 求人情報のデータベース管理（`job-store`によるAPI提供）
- ✅ JWTベースのページネーション機能付き求人一覧API
- ✅ OpenAPI仕様書の自動生成
- ✅ フロントエンドと`job-store` APIの連携
- ✅ 求人一覧表示機能（無限スクロール対応）
- ✅ 求人詳細表示機能
- ✅ レスポンシブなWeb UI

### 開発中・今後の予定

- 🔄 高度な検索・フィルタリング機能
- 🔄 UIの改善・完成
- 📋 認証・認可機能の実装
- 📋 お気に入り機能
- 📋 求人アラート機能

## 技術的特徴

### 型安全性の徹底

- 全パッケージでTypeScript strict modeを有効化
- Zodによるランタイムバリデーション
- Drizzle ORMによる型安全なDB操作
- フロントエンド〜バックエンド〜DBまでの一貫した型管理
- neverthrowによる関数型エラーハンドリング

### モダンな開発体験

- pnpm workspaceによるモノレポ管理
- Biomeによる高速なlint・format
- Huskyによる自動品質チェック
- Renovateによる依存関係自動更新
- Turbopackによる高速な開発サーバー

### 関数型プログラミング

- Effect-tsによる副作用管理
- 堅牢なエラーハンドリング
- 関数の合成による可読性向上

### サーバーレスアーキテクチャ

- AWS Lambda（重い処理）とCloudflare Workers（軽量API）の使い分け
- コスト最適化されたスケーラブルな設計
- インフラコード（AWS CDK）による管理
- EventBridge による定期実行
- CloudWatch アラーム機能

### パフォーマンス最適化

- TanStack React Query による効率的なデータフェッチング
- TanStack React Virtual による大量データの仮想化
- JWTベースのページネーション
- プロキシAPIによるCORS回避

## API仕様

### job-store API

- **ベースURL**: 環境変数 `JOB_STORE_ENDPOINT` で設定
- **OpenAPI仕様書**: `{BASE_URL}/api/v1/docs`

#### エンドポイント

- `POST /api/v1/job` - 求人情報登録
- `GET /api/v1/job/:jobNumber` - 求人詳細取得
- `GET /api/v1/jobs?nextToken={token}` - 求人一覧取得（ページネーション対応）

## 開発ガイドライン

- TypeScriptの厳密な型チェックを有効化
- Biomeによるコードフォーマット統一
- Effectを使用した関数型プログラミング
- neverthrowによるエラーハンドリングの徹底
- テスト駆動開発の推奨

## プロジェクト構成詳細

詳細な技術解説・設計思想については [PORTFOLIO_DETAIL.md](./PORTFOLIO_DETAIL.md)
を参照してください。

## ライセンス

ISC
