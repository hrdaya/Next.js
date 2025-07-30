# Next.js SSR Project

Next.jsでSSRを使用し、AWS ECSで運用するプロジェクトのボイラープレート。

開発体験の向上を目的として各種ライブラリは高速化に動作するものを選定している。

> **🔧 開発者向け情報** (コーディング規約、ワークフロー、内部運用ルール) は [`.github/.instructions.md`](.github/.instructions.md) をご覧ください。

## TODO

- [ ] src/utils/serverApiProxy.tsのエラー時の画面表示を精査
  - 500と503の切り分け等
- [ ] 各種レスポンスの内容の確認
  - [ ] ページ初期読み込み
  - [ ] サーバーアクション
  - [ ] APIリクエスト
  - [ ] ファイルアップロード
  - [ ] ファイルダウンロード

## 📋 目次

- [技術スタック](#技術スタック)
- [主要機能](#主要機能)
- [フォルダ構成](#フォルダ構成)
- [セットアップ](#セットアップ)
- [開発](#開発)
- [AWS ECS デプロイ](#aws-ecs-デプロイ)

## 技術スタック

- **Next.js 15** - React フレームワーク（App Router使用）
- **React 19** - UIライブラリ
- **TypeScript 5.8** - 型安全なJavaScript
- **Tailwind CSS 4** - ユーティリティファーストCSSフレームワーク
- **Biome** - リンター & フォーマッター
- **Lefthook** - Git フック管理
- **i18next + react-i18next** - 国際化
- **Vitest** - テストフレームワーク
- **Storybook 9** - コンポーネント開発環境

## 主要機能

### 認証システム

- **JWT ベースの認証** - httpOnly Cookie による安全なトークン管理（バックエンドサーバー側で実装）
- **自動トークンリフレッシュ** - 401エラー検知時の自動JWT更新機能（バックエンドサーバー側で実装）
- **Route Groups** - `(authenticated)` フォルダによる認証必須ページの自動保護

### API通信

- **serverApiProxy** - Server Components 専用のプロキシ経由API通信ユーティリティ
  - プロキシAPI（`/api/proxy`）経由でのバックエンド通信
  - GET/POST/PUT/DELETE全メソッド対応
  - エラーハンドリングの統一
  - 国際化対応エラーメッセージ
  - TypeScript型安全性
- **useApiRequest** - Client Components 用のAPI通信フック
  - プロキシAPI（`/api/proxy`）経由でのバックエンド通信
  - HTTP メソッド別の専用関数（get/create/update/del/upload/download）
  - エラーハンドリングの統一
  - 国際化対応エラーメッセージ
  - ファイルアップロード・ダウンロード対応
  - TypeScript型安全性

#### プロキシAPI（`/api/proxy`）

- JWTトークンの自動付与（httpOnlyクッキー⇒Bearerトークン変換）
- X-Language ヘッダーの自動付与（現在の言語設定やAccept-Language から検出）
- Next.js `cache: 'no-store'` でリアルタイムデータ取得
- バックエンドサーバーの隠ぺい

### ユーティリティ関数

- **ファイル操作** - ファイル読み込み、変換、バリデーション
- **文字列操作** - フォーマット、変換、バリデーション
- **日付操作** - フォーマット、ローカライゼーション
- **バリデーション** - 型ガード、データ検証
- **クラス名管理** - Tailwind CSS との統合

### 国際化

- **サーバーサイドi18n** - Accept-Language ヘッダーベースの自動言語検出
  - `getServerI18n()` によるサーバーサイド翻訳
  - Server Components での多言語対応
  - SEO対応の初期言語設定
- **クライアントサイドi18n** - react-i18next による動的言語切り替え
  - `LanguageSwitcher` - 言語切り替えコンポーネント
  - リアルタイム言語切り替え
  - ローカルストレージによる言語設定の永続化
- **API通信での言語連携**
  - X-Language ヘッダーによるバックエンドへの言語情報送信
  - サーバーサイド・クライアントサイド共通の言語ヘッダー対応
  - エラーメッセージの多言語対応（日本語・英語）
- **型安全な翻訳** - TypeScript サポート
- **動的フォント切り替え** - 言語に応じて最適なフォントを自動適用

### テスト

- **Vitest** - 高速なユニットテスト
- **包括的なカバレッジ** - ユーティリティ関数の完全テスト
- **型安全性** - TypeScript によるテストコード

## フォルダ構成

> **🔧 詳細な内部設計については** [`.github/.instructions.md`](.github/.instructions.md#開発用フォルダ構成内部設計) **をご覧ください。**

```ini
./
├── deploy/                  # AWS ECSデプロイ設定
├── public/                  # 静的ファイル
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (authenticated)/ # 🔒 認証必須ページ群
│   │   └── api/             # API Routes
│   ├── components/          # UIコンポーネント (Atomic Design)
│   ├── constants/           # 定数
│   ├── features/            # 機能ごと（ドメイン）のロジック
│   ├── hooks/               # カスタムフック
│   ├── lib/                 # ライブラリ設定 (認証・国際化)
│   ├── locales/             # 国際化メッセージ
│   ├── tests/               # テストファイル
│   ├── types/               # TypeScript型定義
│   └── utils/               # ユーティリティ関数
├── .github/                 # GitHub Actions・開発ガイドライン
├── .storybook/              # Storybook設定
├── biome.json               # Biome設定
├── next.config.js           # Next.js設定
└── 設定ファイル類
```

## セットアップ

開発者の環境による違いによる差異を無くすため `Volta` を使用した開発環境のセットアップを行います。

なお、package.json に記載されているNode.js、pnpmのバージョンを再現できるのであれば、ツールは `Volta` を使用することを強制するものではありません。

### 前提条件

- [Volta](https://volta.sh/) - Node.jsとpnpmのバージョン管理
- Node.js（Voltaで自動管理）
  - package.jsonでバージョン指定
- pnpm（Voltaで自動管理）
  - package.jsonでバージョン指定

### Voltaのセットアップ

Voltaがインストールされていない場合は、以下のコマンドでインストールしてください：

```bash
# macOS/Linux
curl https://get.volta.sh | bash

# corepack のインストール
volta install corepack

# シェルを切り替えてcorepackとpnpmの有効化
corepack enable
corepack enable pnpm

# pnpmのバージョン確認（ダウンロードしますかと聞かれるのでYを入力してダウンロード・インストール）
pnpm -v
```

プロジェクトでは`package.json`にVoltaの設定が含まれており、プロジェクトディレクトリに入ると自動的に適切なNode.jsとpnpmのバージョンが使用されます。

### インストール

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env.local

# Git フックのインストール
pnpm lefthook install
```

## 開発

デバッグ環境も構築しているので、ブレイクポイントを設定してコードを一時停止させることも可能です。

サーバーサイドのモックをExpress.jsを使用して立ち上げることも可能です。

```bash
# 開発サーバー起動
pnpm dev

# リント・フォーマット実行
pnpm check

# 型チェック実行
pnpm check:type

# テスト実行
pnpm test

# Storybook起動
pnpm storybook
```

## ビルド（本番用）

```bash
# プロダクションビルド
pnpm build

# プロダクションサーバー起動
pnpm start
```

## AWS ECS デプロイ

deploy/ディレクトリにAWS ECSへのデプロイ用ファイルが含まれています：

- `Dockerfile` - standalone出力を使用した軽量なDockerイメージ
- `buildspec.yml` - AWS CodeBuildでのビルド設定
- `task-definition.json` - ECSタスク定義（読み取り専用ファイルシステム対応）
- `appspec.yml` - AWS CodeDeployでのBlue/Greenデプロイ設定（動的生成）
- `setup_ec2_dev.sh` - EC2インスタンス用開発環境セットアップスクリプト
- `README.md` - 詳細なデプロイ手順とCI/CD設定

詳細は `deploy/README.md` を参照してください。

### EC2での開発環境セットアップ

EC2インスタンス（Amazon Linux 2023）で開発環境を構築する場合は、以下のコマンドでワンライン セットアップが可能です：

```bash
# EC2インスタンスにSSH接続後、以下を実行
curl -s https://raw.githubusercontent.com/リポジトリ/main/deploy/setup_ec2_dev.sh | bash

# または、リポジトリをクローンしてから実行
git clone https://github.com/リポジトリ.git
cd nextjs-ssr
chmod +x deploy/setup_ec2_dev.sh
./deploy/setup_ec2_dev.sh
```

このスクリプトは以下の処理を自動的に実行します：

- システムパッケージの更新
- Volta、Node.js、pnpmのインストール
- プロジェクトのクローン
- 依存関係のインストール
- PM2を使用した開発サーバーの起動
- ファイアウォール設定（ポート3000の開放）

**注意事項：**

- EC2のセキュリティグループでポート3000（HTTP）を開放してください
- `setup_ec2_dev.sh`内の`REPO_URL`を実際のリポジトリURLに変更してください

## スクリプト

- `dev` - 開発サーバー起動（デバッグモード有効）
- `build` - プロダクションビルド（standalone出力）
- `start` - プロダクションサーバー起動
- `lint` - Biomeでリント実行
- `lint:fix` - Biomeでリント修正
- `format` - Biomeでフォーマット
- `check` - Biomeでチェック
- `check:type` - 型チェック
- `test` - Vitestでテスト実行
- `test:watch` - Vitestでテスト監視
- `test:coverage` - テストカバレッジ
- `storybook` - Storybook起動
- `build-storybook` - Storybookビルド

## 特徴

### バージョン管理

- **Volta**によるNode.jsとpnpmのバージョン固定
- チーム全体で一貫した開発環境を保証
- プロジェクトディレクトリへの移動時に自動的にバージョン切り替え

### Next.js Standalone出力

- `next.config.js`で`output: 'standalone'`を設定
- Docker環境での軽量化とセキュリティ向上
- 読み取り専用ファイルシステムでの運用に対応

### セキュリティ

- ECSでの読み取り専用ファイルシステム（`readonlyRootFilesystem: true`）
- 最小限の依存関係とランタイム環境
- Docker multi-stage buildによる軽量化

### CI/CD

- AWS CodeBuild、CodePipeline、CodeDeployによる自動デプロイ
- Blue/Greenデプロイメント対応
- 環境変数による柔軟な設定管理

## 環境変数

`.env.example`を参考に`.env.local`ファイルを作成してください。

## ライセンス

MIT
