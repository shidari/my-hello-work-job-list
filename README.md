# Hello Work Searcher(未完成)

求人情報の自動収集・管理システム

## 概要

このプロジェクトは、ハローワークの求人情報を自動的にクロール・スクレイピングし、管理・検索できるシステムです。モノレポ構成で、フロントエンド、データベース・API、クローラーなどの各機能を独立したパッケージとして管理しています。

## アーキテクチャ

### 全体構成

```
hello-work-searcher/
├── packages/
│   ├── schema/          # 共通スキーマ定義
│   ├── headless-crawler/ # ハローワーククローラー
│   ├── job-store/       # 求人情報データベース・API
│   └── frontend/       # フロントエンド
├── pnpm-workspace.yaml # モノレポ設定
└── biome.json         # コードフォーマッター設定
```



### 技術スタック

#### 共通
- **パッケージマネージャー**: pnpm (workspace)
- **言語**: TypeScript
- **コードフォーマッター**: Biome
- **Git Hooks**: Husky + lint-staged

#### 各パッケージ

##### `@sho/schema`
- **目的**: 共通の型定義とスキーマ
- **技術**: 
  - Zod (スキーマバリデーション)
  - Chanfana (型生成)

##### `headless-crawler`
- **目的**: ハローワークサイトのクローリング・スクレイピング
- **技術**:
  - Playwright (ブラウザ自動化)
  - AWS CDK (インフラ管理)
  - Effect (関数型プログラミング)
  - Jest (テスト)
- **機能**:
  - 求人検索条件に基づく求人一覧取得
  - 個別求人詳細情報のスクレイピング
  - AWS Lambda対応

##### `job-store`
- **目的**: 求人情報のデータベース管理・API提供
- **技術**:
  - Cloudflare Workers
  - Drizzle ORM
  - Hono (Webフレームワーク)
  - D1 (SQLite)
  - Chanfana (OpenAPI生成)
- **機能**:
  - 求人情報の保存・取得
  - ページネーション対応
  - RESTful API提供
  - OpenAPI仕様書自動生成

##### `frontend`
- **目的**: ユーザーインターフェース
- **技術**:
  - Next.js 15
  - React 19
  - Turbopack

## 開発環境セットアップ

### 前提条件
- Node.js
- pnpm
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
cd packages/frontend
pnpm dev
```

#### クローラー
```bash
cd packages/headless-crawler
pnpm build
pnpm verify:crawler  # クローラー動作確認
pnpm verify:scraper  # スクレイパー動作確認
```

#### データベース・API
```bash
cd packages/job-store
pnpm migrate  # マイグレーション実行
pnpm dev      # ローカル開発サーバー
```

## デプロイ

### クローラー (AWS)
```bash
cd packages/headless-crawler
pnpm bootstrap  # 初回のみ
pnpm deploy
```

### データベース・API (Cloudflare)
```bash
cd packages/job-store
pnpm deploy
```

### フロントエンド
```bash
cd packages/frontend
pnpm build
# Vercel等にデプロイ
```

## データフロー

1. **クローリング**: `headless-crawler`がハローワークサイトから求人情報を収集
2. **データ保存**: 収集したデータを`job-store`に保存
3. **API提供**: `job-store`がフロントエンドにデータを提供
4. **表示**: `frontend`でユーザーに求人情報を表示

## 主要機能

- 求人検索条件に基づく自動クローリング
- 求人詳細情報の自動スクレイピング
- 求人情報のデータベース管理
- 求人検索・フィルタリング機能
- レスポンシブなWeb UI

## 開発ガイドライン

- TypeScriptの厳密な型チェックを有効化
- Biomeによるコードフォーマット統一
- Effectを使用した関数型プログラミング
- エラーハンドリングの徹底
- テスト駆動開発の推奨

## ライセンス

ISC 