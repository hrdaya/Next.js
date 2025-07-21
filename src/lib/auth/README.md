# 認証モジュール構成

## 📁 ファイル構成

```text
src/lib/auth/
├── AuthRequired.tsx      # 認証が必要なページ用のラッパーコンポーネント
├── index.ts             # ライブラリのエントリーポイント
├── jwt.ts               # JWT関連のユーティリティ関数（ローカル検証・トークン検証）
├── jwtCookie.ts         # JWT Cookie管理とリフレッシュ機能
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
- `JWTPayload`, `TokenVerificationResult` - 型定義
- 外部サーバーへの問い合わせなしで高速検証

### `jwtCookie.ts`

- **httpOnly Cookie**を使用したJWT管理とリフレッシュ機能
- `getJwtCookie()` - サーバーサイドでのJWT取得
- `setJwtCookie()` - セキュアなJWTクッキーの設定（有効期限対応）
- `clearJwtCookie()` - JWTクッキーの削除
- `secureJwtResponse()` - JWTの安全な処理とクッキー設定
- `setJwtAuthHeader()` - リクエストヘッダーにJWT認証トークンを設定
- `tryRefreshJwt()` - JWT自動リフレッシュ機能
- Server Components、API Routes で使用
- XSS攻撃からJWTトークンを保護する安全な実装

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
  getJwtCookie,
  setJwtCookie,
  tryRefreshJwt,
  type JWTPayload,
  type TokenVerificationResult
} from '@/lib/auth';

// サーバーアクションでのログアウト
import { signOutAction } from '@/features/auth/actions/SignOut';

// または特定モジュールから直接インポート
import { isJWTValid } from '@/lib/auth/jwt';
import { getJwtCookie } from '@/lib/auth/jwtCookie';
```

### AuthRequiredコンポーネントの使用

```tsx
// src/app/(authenticated)/layout.tsx
import AuthRequired from '@/lib/auth/AuthRequired';
// または
import { AuthRequired } from '@/lib/auth';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthRequired>{children}</AuthRequired>;
}
```

### ローカルJWT検証（推奨）

```tsx
// 高速なローカル検証（外部サーバーへの問い合わせなし）
import { verifyTokenLocally, isJWTValid } from '@/lib/auth';

export default async function ProtectedPage() {
  const token = await getJwtCookie();

  if (!token || !isJWTValid(token)) {
    return <div>認証が必要です</div>;
  }

  // ユーザー情報も取得可能
  const { user } = verifyTokenLocally(token);

  return <div>ようこそ、{user?.name}さん</div>;
}
```

### API Routes での認証

```tsx
// app/api/protected/route.ts
import { getJwtCookie, verifyTokenLocally } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = await getJwtCookie();

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ローカル検証で高速チェック
  const { isValid, isExpired, user } = verifyTokenLocally(token);

  if (!isValid || isExpired) {
    return NextResponse.json({ error: 'Token expired' }, { status: 401 });
  }

  // 認証済みAPI処理
  return NextResponse.json({
    message: 'Protected data',
    user: user
  });
}
```

### セッション管理（クッキー操作）

```tsx
// app/api/auth/signin/route.ts
import { setJwtCookie, clearJwtCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// サインイン処理
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 認証サーバーでユーザー認証
    const response = await authenticateUser(email, password);

    if (response.success && response.jwt) {
      // 成功時：セキュアなJWTクッキーを設定
      const apiResponse = NextResponse.json({
        success: true,
        user: response.user
      });

      setJwtCookie(apiResponse, response.jwt);
      return apiResponse;
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// サインアウト処理
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // JWTクッキーを安全に削除
  clearJwtCookie(response);

  return response;
}
```

### JWT詳細検証

```tsx
import {
  decodeJWT,
  getJWTExpirationTime,
  getJWTUserInfo,
  type JWTPayload
} from '@/lib/auth';

// JWT情報の詳細取得（型安全）
export async function getTokenDetails(token: string) {
  try {
    // ペイロードのデコード（型安全）
    const payload: JWTPayload = decodeJWT(token);

    // 有効期限の残り時間（秒）
    const remainingTime = getJWTExpirationTime(token);

    // ユーザー情報の抽出
    const userInfo = getJWTUserInfo(token);

    return {
      payload,
      remainingTime,
      userInfo,
      expiresAt: new Date(payload.exp * 1000),
      issuedAt: new Date(payload.iat * 1000),
      subject: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    console.error('JWT parsing error:', error);
    return null;
  }
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

## 📚 関連ファイル

### API Routes (認証エンドポイント)

```text
src/app/api/auth/
├── signin/route.ts       # POST /api/auth/signin - サインイン処理
└── me/route.ts           # GET /api/auth/me - ユーザー情報取得
```

### サーバーアクション (認証機能)

```text
src/features/auth/actions/
└── SignOut.ts            # サーバーアクション - ログアウト処理
```

### Route Groups (認証保護)

```text
src/app/(authenticated)/
├── layout.tsx            # 認証チェック付きレイアウト
├── page.tsx              # 保護されたホームページ
└── loading.tsx           # ローディングページ
```

### エラーページ

```text
src/app/
├── error.tsx             # エラーページ
├── unauthorized.tsx      # 401 Unauthorized ページ
├── forbidden.tsx         # 403 Forbidden ページ
└── not-found.tsx         # 404 Not Found ページ
```

## 🛡️ セキュリティ特徴

### httpOnly Cookie の利点

- **XSS攻撃への耐性**: JavaScriptからアクセス不可
- **CSRF対策**: SameSite属性による保護
- **自動送信**: ブラウザが自動的にCookieを送信
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

## 🔧 開発・運用のヒント

### パフォーマンス最適化

```tsx
// ✅ 推奨: ローカル検証で高速処理
import { isJWTValid, verifyTokenLocally } from '@/lib/auth';

const isAuthenticated = isJWTValid(token);

// ✅ ローカル検証のみ利用可能
const result = verifyTokenLocally(token);
```

### デバッグ方法

```bash
# Cookie の確認
# ブラウザの開発者ツール → Application → Cookies → auth-token

# JWT内容の確認
# jwt.io でJWTトークンをデコードして内容確認

# ローカル検証のテスト
# コンソールで isJWTValid(token) を実行して有効性確認
# コンソールで getJWTExpirationTime(token) で残り時間を確認

# AuthRequired コンポーネントのログ確認
# Next.js の開発サーバーコンソールをチェック

# トークン検証の確認
# /api/auth/me エンドポイントでトークン状態をテスト
```

### 環境変数

```bash
# .env.local に設定が必要な項目（例）
AUTH_SECRET=your_jwt_secret_key
AUTH_SERVER_URL=https://your-auth-server.com
COOKIE_DOMAIN=localhost  # 本番では実際のドメイン
```

### トラブルシューティング

- **認証状態が更新されない**: httpOnly Cookie が正しくクリアされているかブラウザの開発者ツールで確認
- **AuthRequired でリダイレクトループ**: `/signin` ページの実装とRoute Groupsの設定を確認
- **サーバーサイドエラー**: `getJwtCookie()` 呼び出し時のクッキーアクセス権限を確認
