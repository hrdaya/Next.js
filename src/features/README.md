# Features ディレクトリ

このディレクトリには、アプリケーションの機能（Feature）ごとに分割されたロジック層のコンポーネントが格納されています。
`src/app`をベースとするNext.js App Routerアーキテクチャにおいて、ビジネスロジックと機能特有のコンポーネントを分離し、保守性と再利用性を向上させます。

## アーキテクチャ概念

### App Router との関係

```text
src/app/                    # Next.js App Router - ルーティング層
├── (authenticated)/        # ルートグループ
│   └── page.tsx           # → src/features の components を使用
├── signin/
│   └── page.tsx           # → src/features の components を使用
└── layout.tsx

src/features/               # Feature層 - ビジネスロジック層
├── auth/                  # 認証機能
├── dashboard/             # ダッシュボード機能
├── errors/                # エラーページ機能
└── users/                 # ユーザー管理機能
```

**設計原則:**

- `src/app` のページコンポーネントは **ルーティングとデータ取得** に専念
- `src/features` のコンポーネントは **UI表示とビジネスロジック** を担当
- 機能ごとの境界を明確にし、関心の分離を実現

## ディレクトリ構成

```text
src/features/
├── [feature-name]/         # 機能名（例: top, auth, users）
│   ├── components/         # 機能特有のコンポーネント
│   │   ├── ComponentName.tsx
│   │   └── index.ts
│   ├── hooks/             # 機能特有のReact Hooks
│   │   ├── useFeature.ts
│   │   └── index.ts
│   ├── types/             # 機能特有の型定義（オプション）
│   │   └── index.ts
│   ├── utils/             # 機能特有のユーティリティ（オプション）
│   │   └── index.ts
│   └── README.md          # 機能の説明（オプション）
└── README.md              # このファイル
```

## 各ディレクトリの役割

### `components/`

機能特有のUIコンポーネント

- その機能でのみ使用されるコンポーネント
- ATOMIC デザインの `organisms` レベルに相当
- 複数の `atoms` や `molecules` を組み合わせた複合コンポーネント

**例:**

- `DashboardPage.tsx`: メインのダッシュボードコンポーネント（現在実装済み）
- `SignIn.tsx`: サインインフォームコンポーネント（現在実装済み）
- `UserProfile.tsx`: ユーザープロフィール表示
- `ProductList.tsx`: 商品一覧表示

### `hooks/`

機能特有のReact Hooks

- その機能に関連するステート管理
- API呼び出しとデータ取得ロジック
- カスタムビジネスロジック

**例:**

- `useAuth.ts`: 認証状態管理
- `useUsers.ts`: ユーザー一覧取得
- `useProducts.ts`: 商品データ管理

### `types/`

機能特有の型定義（オプション）

- その機能で使用される型やインターフェース
- API レスポンス型
- コンポーネント専用の型定義

**例:**

- `auth.ts`: 認証関連の型定義
- `user.ts`: ユーザー関連の型定義
- `api.ts`: API レスポンス型

### `utils/`

機能特有のユーティリティ関数（オプション）

- その機能特有のヘルパー関数
- データ変換ロジック
- バリデーション関数

**例:**

- `validation.ts`: フォームバリデーション
- `formatters.ts`: データフォーマット関数
- `helpers.ts`: その他のヘルパー関数

## 現在の実装状況

### `auth/` 機能

現在実装されている認証機能：

```text
src/features/auth/
├── components/
│   ├── SignIn.tsx         # サインインフォームコンポーネント
│   └── index.ts           # エクスポート用インデックス
```

### `dashboard/` 機能

現在実装されているダッシュボード機能：

```text
src/features/dashboard/
├── components/
│   ├── DashboardPage.tsx  # メインのダッシュボードコンポーネント
│   └── index.ts           # エクスポート用インデックス
```

### `errors/` 機能

現在実装されているエラーページ機能：

```text
src/features/errors/
├── components/
│   ├── NotFoundPage.tsx   # 404エラーページコンポーネント
│   ├── ForbiddenPage.tsx  # 403エラーページコンポーネント
│   └── index.ts           # エクスポート用インデックス
```

**使用例:**

```typescript
// src/app/(authenticated)/page.tsx で使用
import { DashboardPage } from '@/features/dashboard/components/DashboardPage';

export default async function Page() {
  return <DashboardPage />;
}

// src/app/signin/page.tsx で使用（将来的な改善）
import { SignIn } from '@/features/auth/components/SignIn';

// src/app/not-found.tsx で使用
import { NotFoundPage } from '@/features/errors/components/NotFoundPage';

// src/app/forbidden.tsx で使用
import { ForbiddenPage } from '@/features/errors/components/ForbiddenPage';
```

## 機能分割の指針

### 機能の分類例

1. **認証機能 (`auth/`)**
   - サインイン、サインアップ、パスワードリセット
   - ユーザー認証状態管理

2. **ユーザー管理 (`users/`)**
   - ユーザープロフィール管理
   - ユーザー設定、権限管理

3. **ダッシュボード (`dashboard/`)**
   - メインダッシュボード
   - 統計情報、概要表示

4. **エラーページ (`errors/`)**
   - 404 Not Found ページ
   - 403 Forbidden ページ
   - その他のエラーページ

5. **商品管理 (`products/`)**
   - 商品一覧、詳細、検索
   - カート、注文機能

### 分割の基準

**✅ 機能として分割すべき:**

- 独立したビジネス要件を持つ
- 特定のユーザーストーリーに対応
- 再利用可能な単位として成立
- チーム開発での担当分けが可能

**❌ 分割すべきでない:**

- 単一のページでのみ使用
- 他の機能に強く依存
- コードが少なすぎる（1-2ファイルのみ）

## コンポーネント作成ガイドライン

### 1. Server Component vs Client Component

```typescript
// ✅ Server Component（デフォルト）
// src/app で使用するページコンポーネント
export async function UserProfilePage({ userId }: { userId: string }) {
  const user = await fetchUser(userId); // サーバーサイドデータ取得
  return <UserProfile user={user} />;
}

// ✅ Client Component
// src/features/components で使用するインタラクティブコンポーネント
'use client';
export function UserProfile({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);
  // インタラクティブなロジック
}
```

### 2. Props インターフェース

```typescript
interface UserProfileProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  readonly?: boolean;
}
```

### 3. エクスポート規則

```typescript
// components/index.ts
export { UserProfile } from './UserProfile';
export { UserList } from './UserList';
export type { UserProfileProps } from './UserProfile';

// hooks/index.ts
export { useUsers } from './useUsers';
export { useUserProfile } from './useUserProfile';

// types/index.ts
export type { User } from './user';
export type { AuthState } from './auth';

// utils/index.ts
export { validateUser } from './validation';
export { formatUserName } from './formatters';
```

## App Router との連携

### ページコンポーネントの使用例

```typescript
// src/app/users/[id]/page.tsx
import { UserProfile } from '@/features/users/components';
import { getUserById } from '@/lib/api/users';

interface Props {
  params: { id: string };
}

export default async function Page({ params }: Props) {
  // サーバーサイドでデータを取得
  const user = await getUserById(params.id);
  
  return (
    <div className="container mx-auto px-4">
      <UserProfile user={user} />
    </div>
  );
}
```

### データフェッチングパターン

```typescript
// ✅ サーバーサイドデータフェッチング（推奨）
// src/app/users/[id]/page.tsx
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUserById(params.id); // サーバーサイドAPI呼び出し
  
  return (
    <div>
      <UserProfile user={user} />
      <UserActions userId={params.id} />
    </div>
  );
}

// ✅ クライアントサイドデータフェッチング
// src/features/users/components/UserActions.tsx
'use client';
export function UserActions({ userId }: { userId: string }) {
  const { user, updateUser } = useUserProfile(userId);
  // クライアントサイドのインタラクティブな処理
}
```

## 命名規則

### ファイル命名

```text
// Components
UserProfile.tsx         # メインコンポーネント
UserProfileForm.tsx     # フォームコンポーネント
UserList.tsx           # リストコンポーネント

// Hooks
useUsers.ts            # ユーザー関連のhook
useAuth.ts             # 認証関連のhook

// Types
user.ts               # ユーザー関連の型
auth.ts               # 認証関連の型
api.ts                # API関連の型

// Utils
validation.ts         # バリデーション関数
formatters.ts         # データフォーマット関数
helpers.ts            # ヘルパー関数
```

### 機能名の命名

```text
auth/                 # 認証
users/                # ユーザー管理
products/             # 商品管理
orders/               # 注文管理
dashboard/            # ダッシュボード
settings/             # 設定
admin/                # 管理者機能
```

## テストとストーリー

### テスト構成

```text
src/features/users/
├── components/
│   ├── UserProfile.tsx
│   └── UserProfile.test.tsx    # コンポーネントテスト
├── hooks/
│   ├── useUsers.ts
│   └── useUsers.test.ts        # Hookテスト
├── types/
│   └── user.ts
└── utils/
    ├── validation.ts
    └── validation.test.ts      # ユーティリティテスト
```

### Storybook対応

```typescript
// UserProfile.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { UserProfile } from './UserProfile';

const meta: Meta<typeof UserProfile> = {
  title: 'Features/Users/UserProfile',
  component: UserProfile,
  parameters: { layout: 'centered' },
};

export default meta;
```

## 依存関係管理

### インポート順序

```typescript
// 1. React関連
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. 外部ライブラリ
import { useTranslation } from 'react-i18next';

// 3. 内部共通ライブラリ
import { Button } from '@/components/atoms';
import { Header } from '@/components/molecules';

// 4. 同一機能内のインポート
import { useUsers } from '../hooks';
import { validateUser } from '../utils';
import type { User } from '../types';
```

### 依存関係のルール

**✅ 許可される依存関係:**

- `src/components` (atoms, molecules) への依存
- `src/lib` (共通ライブラリ) への依存
- 同一機能内のコンポーネント間の依存
- 外部ライブラリへの依存

**❌ 避けるべき依存関係:**

- 他の機能 (`src/features/other/`) への直接依存
- `src/app` への依存（逆方向の依存）
- 循環依存

## ベストプラクティス

### 1. 単一責任の原則

- 各機能は単一のビジネス要件を満たす
- コンポーネントは単一の責任を持つ

### 2. 依存関係の最小化

- 必要最小限の依存関係に留める
- 機能間の結合度を低く保つ

### 3. 再利用性の考慮

- 機能特有だが、将来的に他の機能でも使用される可能性のあるコンポーネントは適切に抽象化

### 4. パフォーマンス最適化

- Server Componentを活用したSSR対応
- 適切なコード分割とレイジーローディング

### 5. 型安全性

- TypeScriptを活用した堅牢な型定義
- Props インターフェースの明確な定義

## 参考リンク

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)

## 注意事項

1. **機能の境界** を明確に定義し、責任を分離する
2. **App Router のルーティング** と Feature の構造を対応させる
3. **Server Component と Client Component** を適切に使い分ける
4. **共通コンポーネント** は `src/components` に配置する
5. **機能間の依存関係** を最小限に抑える
