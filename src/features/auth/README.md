# Authentication Feature

認証機能を管理するフィーチャーモジュールです。

## 概要

このモジュールは以下の機能を提供します：

- ログインページの表示とフォーム処理
- ログアウト機能
- 認証エラーハンドリング
- ローディング状態の管理

## ファイル構造

```text
src/features/auth/
├── actions/                    # Server Actions
│   └── SignOut.ts             # ログアウト処理
├── components/                 # 複合コンポーネント
│   ├── index.ts               # エクスポート管理
│   └── LogoutButton.tsx       # ログアウトボタン
├── pages/                     # ページレベルコンポーネント
│   ├── index.ts               # エクスポート管理
│   └── SignInPage.tsx         # ログインページロジック
├── ui/                        # UIコンポーネント
│   ├── index.ts               # エクスポート管理
│   └── SignInForm.tsx         # ログインフォームUI
└── README.md                  # このファイル
```

## コンポーネント設計

### 階層構造

1. **Pages** (`pages/`): ページレベルのロジックコンポーネント
   - `SignInPage`: ログインページの状態管理とビジネスロジック

2. **UI** (`ui/`): プレゼンテーション専用コンポーネント
   - `SignInForm`: ログインフォームのUI表示とバリデーション

3. **Components** (`components/`): 複合的なインタラクティブコンポーネント
   - `LogoutButton`: ログアウト機能付きボタン

### 使用方法

```tsx
// ログインページの使用
import { SignInPage } from '@/features/auth/components';

export default function SignInRoute() {
  return <SignInPage />;
}

// ログアウトボタンの使用
import { LogoutButton } from '@/features/auth/components';

export function Header() {
  return (
    <header>
      <LogoutButton />
    </header>
  );
}
```

## Server Actions

### SignOut.ts

ログアウト処理を担当するServer Action：

- JWTトークンのクリア
- バックエンドAPIへのログアウト通知
- 適切なリダイレクト処理

```tsx
import { signOutAction } from '@/features/auth/actions/SignOut';

// 使用例
await signOutAction();
```

## 関連するライブラリ

- `@/lib/auth`: 認証ライブラリの基盤機能
- `react-i18next`: 多言語化対応
- `Next.js App Router`: サーバーアクションとルーティング
