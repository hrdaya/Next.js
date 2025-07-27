# 認証モジュール構成

## 📁 ファイル構成

```text
src/lib/auth/
├── AuthRequired.tsx      # 認証が必要なページ用のラッパーコンポーネント
├── index.ts             # ライブラリのエントリーポイント
├── jwt.ts               # JWT関連のユーティリティ関数（ローカル検証・トークン検証・Cookie取得）
└── README.md            # このドキュメント
```

## 🏗️ 設計思想

このプロジェクトの認証システムは **httpOnly Cookie** を使用した安全なJWT管理を採用しており、**ローカル検証**によるパフォーマンス最適化を実現しています：

- **セキュリティ重視**: XSS攻撃からJWTトークンを保護
- **ローカル検証**: 外部サーバーへの問い合わせなしでJWT有効期限をチェック
- **サーバーサイド認証**: Server Components での初期認証チェック
- **Route Groups**: `(authenticated)` フォルダによる自動保護
- **AuthRequired統合**: コンポーネントベースの認証管理
- **高速処理**: ローカル検証による即座のレスポンス

## 📋 各ファイルの役割

### `AuthRequired.tsx`

- 認証が必要なページ用のラッパーコンポーネント
- サーバーサイドでセッションをチェックし、ローカルでJWTの有効期限を検証
- 未認証または期限切れの場合は `unauthorized()` を実行
- Route Groups の layout.tsx で使用

### `index.ts`

- ライブラリのエントリーポイント
- 主要なコンポーネントと関数をエクスポート
- 一括インポートを可能にする便利なインターフェース

### `jwt.ts`

- JWTトークンのローカル検証機能
- `decodeJWT()` - JWTペイロードのデコード
- `isJWTValid()` - 有効期限チェック
- `isJWTExpired()` - 期限切れチェック
- `getJWTExpirationTime()` - 有効期限までの残り時間取得
- `getJWTUserInfo()` - ユーザー情報の抽出
- `verifyTokenLocally()` - ローカルでのJWT有効期限チェック（高速検証）
- `getJwtFromCookie()` - サーバーサイドでHTTPオンリーCookieからJWTを取得
- `JWTPayload`, `TokenVerificationResult` - 型定義
- 外部サーバーへの問い合わせなしで高速検証

### サーバーアクションによるログアウト

ログアウト機能は、`src/features/auth/actions/SignOut.ts` のサーバーアクションとして実装されています：

- **サーバーアクション**: フォームアクションとして安全に呼び出し可能
- **バックエンド連携**: `/api/logout` エンドポイントに POST リクエスト
- **クッキー削除**: HTTPOnlyクッキーの安全な削除
- **自動リダイレクト**: サインイン画面への自動遷移
- **エラー耐性**: バックエンドエラーでもローカルクッキーは確実に削除

## 🚀 使用方法

### 基本的なインポート例

```tsx
// 必要な機能のみをインポート
import {
  AuthRequired,
  verifyTokenLocally,
  isJWTValid,
  getJwtFromCookie,
  type JWTPayload,
  type TokenVerificationResult
} from '@/lib/auth';

// サーバーアクションでのログアウト
import { signOutAction } from '@/features/auth/actions/SignOut';

// または特定モジュールから直接インポート
import { isJWTValid } from '@/lib/auth/jwt';
```

### ローカルJWT検証（推奨）

```tsx
// 高速なローカル検証（外部サーバーへの問い合わせなし）
import { verifyTokenLocally, isJWTValid, getJwtFromCookie } from '@/lib/auth';

export default async function ProtectedPage() {
  const token = await getJwtFromCookie();

  if (!token || !isJWTValid(token)) {
    return <div>認証が必要です</div>;
  }

  // ユーザー情報も取得可能
  const { user } = verifyTokenLocally(token);

  return <div>ようこそ、{user?.name}さん</div>;
}
```

### 認証保護の仕組み

```tsx
// 認証システムは Route Groups + AuthRequired パターンを採用
// 従来のミドルウェア方式は使用していません

// src/app/(authenticated)/layout.tsx
import AuthRequired from '@/lib/auth/AuthRequired';

/**
 * 認証が必要なページのレイアウト
 * AuthRequiredコンポーネントで認証チェックを実行
 * このパターンにより、(authenticated)フォルダ内のすべてのページが自動的に保護される
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthRequired>{children}</AuthRequired>;
}
```

### サーバーアクションでのログアウト処理

```tsx
import { signOutAction } from '@/features/auth/actions/SignOut';

// フォームアクションとしての使用（推奨）
export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="btn btn-secondary">
        ログアウト
      </button>
    </form>
  );
}

// ボタンクリックでの使用
import { useTransition } from 'react';

export function LogoutButtonAsync() {
  const [isPending, startTransition] = useTransition();
  
  const handleLogout = () => {
    startTransition(() => {
      signOutAction();
    });
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isPending}
      className="btn btn-secondary"
    >
      {isPending ? 'ログアウト中...' : 'ログアウト'}
    </button>
  );
}
```

## 🛡️ セキュリティ特徴

### httpOnly Cookie の利点

- **XSS攻撃への耐性**: JavaScriptからアクセス不可
- **CSRF対策**: SameSite属性による保護
- **サーバーサイド管理**: Server Componentsで直接アクセス可能

### ローカルJWT検証の利点

- **高速処理**: 外部サーバーへの問い合わせが不要
- **可用性向上**: 外部サービスの障害の影響を受けない
- **コスト削減**: APIコール数の削減
- **レスポンス改善**: ネットワーク遅延の排除
- **シンプルな設計**: 複雑な外部依存を排除した軽量アーキテクチャ

### 認証チェックポイント

1. **AuthRequiredコンポーネント**: ページレベルでの自動認証チェック
2. **Route Groupsレベル**: `(authenticated)` フォルダ内の自動保護
3. **API Routeレベル**: 個別APIでの認証チェック
4. **Server Componentレベル**: コンポーネント内での認証状態確認
