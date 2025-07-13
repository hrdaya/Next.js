# 認証モジュール構成

## 📁 ファイル構成

```text
src/lib/auth/
├── AuthRequired.tsx      # 認証が必要なページ用のラッパーコンポーネント
├── index.ts             # ライブラリのエントリーポイント
├── jwt.ts               # JWT関連のユーティリティ関数（ローカル検証）
├── session.ts           # JWT Session管理 (httpOnly Cookie)
├── tokenVerification.ts # トークン検証処理（ローカル・外部）
├── middleware.ts        # 認証ミドルウェア処理
├── utils.ts             # 認証ユーティリティ関数
└── README.md            # このドキュメント
```

## 🏗️ 設計思想

このプロジェクトの認証システムは **httpOnly Cookie** を使用した安全なJWT管理を採用しており、**ローカル検証**によるパフォーマンス最適化を実現しています：

- **セキュリティ重視**: XSS攻撃からJWTトークンを保護
- **ローカル検証**: 外部サーバーへの問い合わせなしでJWT有効期限をチェック
- **サーバーサイド認証**: Server Components での初期認証チェック
- **Route Groups**: `(authenticated)` フォルダによる自動保護
- **ミドルウェア統合**: Next.js middleware による認証状態管理

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

### `jwt.ts` (NEW!)

- JWTトークンのローカル検証機能
- `isJWTValid()` - 有効期限チェック
- `isJWTExpired()` - 期限切れチェック
- `decodeJWT()` - JWTペイロードのデコード
- `getJWTUserInfo()` - ユーザー情報の抽出
- 外部サーバーへの問い合わせなしで高速検証

### `session.ts`

- **httpOnly Cookie**を使用したJWT Session管理
- `getServerSession()` - サーバーサイドでのJWT取得
- `getClientSession()` - クライアントサイドでのJWT存在確認
- Server Components、API Routes、ミドルウェアで使用
- XSS攻撃からJWTトークンを保護する安全な実装

### `tokenVerification.ts`

- **ローカル検証**と**外部サーバー検証**の両方をサポート
- `verifyTokenLocally()` - **推奨**: ローカルでのJWT有効期限チェック
- `verifyTokenWithAuthServer()` - 外部認証サーバーでのトークン検証
- `TokenVerificationResult` - 検証結果の型定義
- パフォーマンス重視のローカル検証を優先使用

### `middleware.ts`

- Next.js ミドルウェアでの認証処理
- `isPublicPath()` - 公開パス判定（/signin, /unauthorized等）
- `isApiRoute()` - APIルート判定
- `handleAuthentication()` - メイン認証処理
- `handleSigninPageAuthentication()` - サインインページ専用処理
- 認証状態に応じた自動リダイレクト

### `utils.ts`

- 認証関連のユーティリティ関数
- `signOut()` - どこからでも呼び出せるサインアウト機能
- httpOnly Cookie をクリアするためのAPI経由実行
- コンポーネントや関数から独立した認証操作

## 🚀 使用方法

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
  const token = await getServerSession();

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
import { getServerSession, verifyTokenLocally } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = await getServerSession();

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

### JWT詳細検証

```tsx
import { 
  decodeJWT, 
  getJWTExpirationTime, 
  getJWTUserInfo 
} from '@/lib/auth';

// JWT情報の詳細取得
export async function getTokenDetails(token: string) {
  try {
    // ペイロードのデコード
    const payload = decodeJWT(token);
    
    // 有効期限の残り時間（秒）
    const remainingTime = getJWTExpirationTime(token);
    
    // ユーザー情報の抽出
    const userInfo = getJWTUserInfo(token);
    
    return {
      payload,
      remainingTime,
      userInfo,
      expiresAt: new Date(payload.exp * 1000),
    };
  } catch (error) {
    console.error('JWT parsing error:', error);
    return null;
  }
}
```

### 外部サーバー検証（オプション）

```tsx
import { verifyTokenWithAuthServer } from '@/lib/auth';

// 外部認証サーバーでの詳細検証（必要な場合のみ）
export async function validateWithRemoteServer(token: string) {
  const result = await verifyTokenWithAuthServer(token);

  if (!result.isValid) {
    console.log('無効なトークンです');
    return null;
  }

  if (result.isExpired) {
    console.log('トークンが期限切れです');
    return null;
  }

  return result.user; // 外部サーバーから取得したユーザー情報
}
```

### ミドルウェア認証処理

```tsx
// src/middleware.ts
import { handleAuthentication } from '@/lib/auth/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await handleAuthentication(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### サインアウト処理

```tsx
import { signOut } from '@/lib/auth/utils';

// 任意のコンポーネントから呼び出し可能
export function LogoutButton() {
  const handleLogout = async () => {
    await signOut();
    // サインアウト後は自動的に /signin にリダイレクト
  };

  return (
    <button onClick={handleLogout}>
      ログアウト
    </button>
  );
}
```

## 📚 関連ファイル

### API Routes (認証エンドポイント)

```text
src/app/api/auth/
├── signin/route.ts       # POST /api/auth/signin - サインイン処理
├── signout/route.ts      # POST /api/auth/signout - サインアウト処理
└── me/route.ts           # GET /api/auth/me - ユーザー情報取得
```

### Route Groups (認証保護)

```text
src/app/(authenticated)/
├── layout.tsx            # 認証チェック付きレイアウト
├── page.tsx              # 保護されたホームページ
├── error.tsx             # エラーページ
├── forbidden.tsx         # 403ページ
└── unauthorized.tsx      # 401ページ
```

### ミドルウェア設定

```text
src/middleware.ts         # プロジェクトルートのミドルウェア
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

### 認証チェックポイント

1. **ミドルウェアレベル**: 全リクエストの入り口で認証チェック
2. **AuthRequiredコンポーネント**: ページレベルでの自動認証チェック
3. **Route Groupsレベル**: `(authenticated)` フォルダ内の自動保護
4. **API Routeレベル**: 個別APIでの認証チェック
5. **Server Componentレベル**: コンポーネント内での認証状態確認

## 🔧 開発・運用のヒント

### パフォーマンス最適化

```tsx
// ✅ 推奨: ローカル検証で高速処理
import { isJWTValid, verifyTokenLocally } from '@/lib/auth';

const isAuthenticated = isJWTValid(token);

// ❌ 非推奨: 毎回外部サーバーに問い合わせ
const result = await verifyTokenWithAuthServer(token);
```

### デバッグ方法

```bash
# Cookie の確認
# ブラウザの開発者ツール → Application → Cookies → auth-token

# JWT内容の確認
# jwt.io でJWTトークンをデコードして内容確認

# ローカル検証のテスト
# コンソールで isJWTValid(token) を実行

# ミドルウェアログの確認
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

- **無限リダイレクト**: `/signin` → `/unauthorized` のループが発生する場合は `handleSigninPageAuthentication` の実装を確認
- **認証状態が更新されない**: httpOnly Cookie が正しくクリアされているかブラウザの開発者ツールで確認
- **ミドルウェアが動作しない**: `middleware.ts` のファイル配置と `config.matcher` の設定を確認

---

## 更新履歴

- **2025-07-14**: ローカルJWT検証機能を追加
  - `jwt.ts` 新規追加によるローカル検証機能の実装
  - `AuthRequired.tsx` をライブラリ化（src/lib/auth配下に移動）
  - `index.ts` 追加によるエントリーポイントの統一
  - `verifyTokenLocally()` 関数の追加
  - パフォーマンス最適化のためローカル検証を推奨に変更
- **2025-07-13**: 実際のファイル構成に合わせて更新
  - httpOnly Cookie ベースの認証システムに対応
  - 実在しないファイル（AuthProvider.tsx等）を削除
  - Mermaid 図を使用した認証フローの視覚化
  - セキュリティ特徴とトラブルシューティングを追加
