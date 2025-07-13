# Next.js SSR Project

Next.jsでSSRを使用し、AWS ECSで運用するプロジェクトのボイラープレート。

開発体験の向上を目的として各種ライブラリは高速化に動作するものを選定している。

> **🔧 開発者向け情報** (コーディング規約、ワークフロー、内部運用ルール) は [`.github/.instructions.md`](.github/.instructions.md) をご覧ください。

## TODO

- [ ] 国際化対応のサーバーサイドコンポーネント、クライアントサイドコンポーネントの両対応の確認
  - 書き方統一したい
- [ ] サーバーサイドコンポーネントのAPI用のロジックの確認
  - 共通処理が正しいかを確認する
- [ ] クライアントサイドコンポーネント用のAPIのproxyが微妙なので見直し
  - ヘッダはBearerのみ付け外しするようにする
  - json以外にblobの場合もあるのでどうするか確認する
  - ストリーム出力の場合はどうなる？
- [ ] 認証のロジックを要確認
  - Route Groupをよく理解していない
  - どこで `(authenticated)` を判定している？Next.jsが自動にやっている？
- [ ] jwtはセッションで保持したいがセッションをRedisで保持するやり方がわからない
  - ブラウザにjwtを保持させたくない
- [ ] ページの配置やサーバーサイドコンポーネント、クライアントサイドコンポーネントの理解を深める
  - page.tsxはコンポーネントの呼び出しだけで実装は`src/features`に集約するのが良さそう
- [ ] `components` フォルダはAIにいいようにやられているのでなんとかする
  - `atoms`と`molecules`のみとしたい（汎用的なUIパーツのみ管理する）
  - `organisms`は`src/features/機能名/components`内に配置する
- [ ] サーバーサイドコンポーネントとapiのproxyでトークンのリフレッシュ処理を入れる
  - バックエンドサーバーからステータスコード401が返却された場合やローカルでjwt検証した際に有効期限切れになっている場合はトークンリフレッシュのエンドポイントを叩き、正常レスポンスがかえってきた場合には再度リクエストを実行する
- [ ] ログインAPIの検証
- [ ] ログアウトAPIの検証
- [ ] リアルタイムバリデーション

## 📋 目次

- [技術スタック](#技術スタック)
- [主要機能](#主要機能)
- [フォルダ構成](#フォルダ構成)
- [使用例](#使用例)
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

- **JWT ベースの認証** - httpOnly Cookie による安全なトークン管理
- **Route Groups** - `(authenticated)` フォルダによる認証必須ページの自動保護
- **サーバーサイド認証** - Server Components での初期認証チェック
- **ミドルウェア** - Next.js middleware による認証状態の管理

### API通信

- **serverApi** - Server Components 専用のAPI通信ユーティリティ
  - JWTトークンの自動付与（httpOnly Cookieから取得）
  - POST専用設計（SSRでのデータ取得に最適化）
  - エラーハンドリングの統一（401/403/404の自動ハンドリング）
  - TypeScript型安全性
  - Next.js `cache: 'no-store'` でリアルタイムデータ取得
- **useApiRequest** - Client Components 用のAPI通信フック
  - 共通エラーハンドリング
  - HTTP メソッド別の専用関数（get/create/update/del/upload/download）
  - TypeScript型安全性

### ユーティリティ関数

- **ファイル操作** - ファイル読み込み、変換、バリデーション
- **文字列操作** - フォーマット、変換、バリデーション
- **日付操作** - フォーマット、ローカライゼーション
- **バリデーション** - 型ガード、データ検証
- **クラス名管理** - Tailwind CSS との統合

### 国際化

- **i18next** - 多言語対応
- **LanguageSwitcher** - 言語切り替えコンポーネント
- **型安全な翻訳** - TypeScript サポート

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
│   ├── hooks/               # カスタムフック
│   ├── lib/                 # ライブラリ設定 (認証・国際化)
│   ├── utils/               # ユーティリティ関数
│   ├── types/               # TypeScript型定義
│   ├── locales/             # 国際化メッセージ
│   └── tests/               # テストファイル
├── .github/                 # GitHub Actions・開発ガイドライン
├── .storybook/              # Storybook設定
├── biome.json               # Biome設定
├── next.config.js           # Next.js設定
└── 設定ファイル類
```

## 使用例

### Server Components での API データ取得

```typescript
// src/app/(authenticated)/users/page.tsx
import { fetchServerData } from '@/utils/serverApi';

interface User {
  id: string;
  name: string;
  email: string;
}

export default async function UsersPage() {
  // fetchServerDataはPOST専用で、第2引数にbodyが必要（空オブジェクトでも可）
  const response = await fetchServerData<User[]>('/api/users', {});

  if (!response.ok) {
    return <div>エラーが発生しました</div>;
  }

  return (
    <div>
      <h1>ユーザー一覧</h1>
      {response.data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

#### フィルタ付きデータ取得の例

```typescript
// src/app/(authenticated)/users/filtered/page.tsx
import { fetchServerData } from '@/utils/serverApi';

interface UserFilter {
  status?: 'active' | 'inactive';
  department?: string;
  limit?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  department: string;
}

export default async function FilteredUsersPage() {
  // POSTボディでフィルタ条件を送信
  const filter: UserFilter = {
    status: 'active',
    department: 'engineering',
    limit: 50
  };

  const response = await fetchServerData<User[]>('/api/users/search', filter);

  if (!response.ok) {
    return (
      <div>
        <h1>エラーが発生しました</h1>
        <ul>
          {response.message.map((msg, index) => (
            <li key={index} className="text-red-600">{msg}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h1>アクティブなエンジニア一覧</h1>
      <p>検索結果: {response.data?.length || 0}件</p>
      {response.data?.map(user => (
        <div key={user.id} className="border p-4 mb-2">
          <h3>{user.name}</h3>
          <p>Email: {user.email}</p>
          <p>Department: {user.department}</p>
          <span className="badge">{user.status}</span>
        </div>
      ))}
    </div>
  );
}
```

#### Server Components での重要な注意点

**POST専用設計について：**

- `fetchServerData`はPOST通信専用です
- GETリクエストでも、必ず第2引数にbodyオブジェクトを渡してください
- 空のデータの場合でも `{}` を渡す必要があります

**エラーハンドリング：**

- 401エラー: `unauthorized()` を自動呼び出し（認証ページにリダイレクト）
- 403エラー: `forbidden()` を自動呼び出し（403ページにリダイレクト）
- 404エラー: `notFound()` を自動呼び出し（404ページにリダイレクト）
- その他エラー: `response.message` 配列にエラー内容が格納

**SSRデータ取得の特徴：**

- `cache: 'no-store'` によりリアルタイムデータを取得
- httpOnly Cookieから自動的にJWTトークンを取得・付与
- Server Component内でのみ使用可能（Client Componentでは使用不可）

```typescript
// ❌ 間違った使用方法
const response = await fetchServerData<User[]>('/api/users'); // 第2引数が必要

// ✅ 正しい使用方法  
const response = await fetchServerData<User[]>('/api/users', {}); // 空オブジェクトでもOK
const response = await fetchServerData<User[]>('/api/users', { limit: 10 }); // データ付きもOK
```

### Client Components での API 通信

```typescript
// src/components/UserForm.tsx
'use client';

import { useApiRequest } from '@/hooks';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

export function UserForm() {
  const api = useApiRequest();
  const [users, setUsers] = useState<User[]>([]);

  // データ取得
  const fetchUsers = async () => {
    const result = await api.get<User[]>('/api/users');
    if (result.ok && result.data) {
      setUsers(result.data);
    }
  };

  // データ作成
  const handleSubmit = async (formData: FormData) => {
    const result = await api.create<User>('/api/users', {
      name: formData.get('name'),
      email: formData.get('email'),
    });

    if (result.ok) {
      console.log('ユーザーが作成されました:', result.data);
      fetchUsers(); // リスト更新
    } else {
      console.error('エラー:', result.message);
    }
  };

  // データ更新
  const updateUser = async (id: string, userData: Partial<User>) => {
    const result = await api.update<User>(`/api/users/${id}`, userData);
    if (result.ok) {
      fetchUsers(); // リスト更新
    }
  };

  // データ削除
  const deleteUser = async (id: string) => {
    const result = await api.del(`/api/users/${id}`, {});
    if (result.ok) {
      fetchUsers(); // リスト更新
    }
  };

  return (
    <div>
      <form action={handleSubmit}>
        <input name="name" placeholder="名前" required />
        <input name="email" type="email" placeholder="メール" required />
        <button type="submit">ユーザー作成</button>
      </form>

      <div>
        <button onClick={fetchUsers}>ユーザー一覧を取得</button>
        {users.map(user => (
          <div key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => deleteUser(user.id)}>削除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 認証が必要なページの作成

```typescript
// src/app/(authenticated)/dashboard/page.tsx
// (authenticated) フォルダ内に配置するだけで自動的に認証チェックが適用される

export default function DashboardPage() {
  // この関数は認証済みユーザーのみがアクセス可能
  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>認証済みユーザーのみ表示されます</p>
    </div>
  );
}
```

### ユーティリティ関数の使用

```typescript
// ファイル操作
import { readFileAsText, isImageFile, formatFileSize } from '@/utils/file';

// 文字列操作
import { toCamelCase, toKebabCase, capitalize } from '@/utils/string';

// バリデーション
import { isEmpty, isValidEmail, isValidUrl } from '@/utils/validation';

// 日付フォーマット
import { formatDate, formatLocalDatetime } from '@/utils/dateFormat';

// クラス名管理
import { cn } from '@/utils/classNames';

const buttonClass = cn(
  'px-4 py-2 rounded',
  isActive && 'bg-blue-500 text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
);
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

```bash
# 開発サーバー起動
pnpm dev

# リント実行
pnpm lint

# フォーマット実行
pnpm format

# テスト実行
pnpm test

# Storybook起動
pnpm storybook
```

## ビルド

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
