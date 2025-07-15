/**
 * JWT Cookie セッション管理ユーティリティ
 *
 * このモジュールは、HTTPOnlyクッキーを使用したJWTトークンの
 * 安全な管理機能を提供します。
 *
 * セキュリティ考慮事項:
 * - HTTPOnlyクッキーによりXSS攻撃からトークンを保護
 * - SameSite=StrictによりCSRF攻撃を防止
 * - Secure属性により本番環境でHTTPS必須
 * - 適切な有効期限設定でセキュリティリスクを最小化
 *
 * アーキテクチャ:
 * - サーバーサイドでは直接クッキーアクセス
 * - クライアントサイドではAPIエンドポイント経由
 * - SSR/CSRの両方に対応した設計
 */

import { cookies } from 'next/headers';

/**
 * サーバーサイドでJWTトークンをHTTPOnlyクッキーから取得
 *
 * この関数はNext.jsのサーバーコンポーネントやAPI Routesでのみ使用可能です。
 * HTTPOnlyクッキーはセキュリティのためクライアントサイドJavaScriptから
 * アクセスできません。
 *
 * 使用場面:
 * - ページの初期レンダリング時（SSR）
 * - サーバーアクション内での認証チェック
 * - API Route内での認証処理
 *
 * セキュリティ機能:
 * - XSS攻撃からトークンを保護
 * - サーバーサイドでのみアクセス可能
 *
 * @returns Promise<string | null> JWTトークン、存在しない場合はnull
 * @throws エラーが発生した場合はnullを返す（ログは出力）
 */
export async function getServerSession(): Promise<string | null> {
  try {
    // Next.js 15の非同期クッキーAPIを使用
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    return token?.value || null;
  } catch (error) {
    // クッキーアクセスエラーをログ出力（デバッグ用）
    console.warn('Failed to access server session:', error);
    return null;
  }
}

/**
 * クライアントサイドでJWTトークンの有効性を確認
 *
 * HTTPOnlyクッキーはクライアントサイドJavaScriptから直接アクセスできないため、
 * APIエンドポイント('/api/auth/me')を経由してトークンの有効性を確認します。
 *
 * 処理フロー:
 * 1. '/api/auth/me'エンドポイントにリクエスト
 * 2. サーバーサイドでクッキーからJWTを取得・検証
 * 3. 有効な場合はAuthorizationヘッダーでトークンを返却
 * 4. クライアントサイドでトークンを受け取り
 *
 * 使用場面:
 * - クライアントサイドでの認証状態確認
 * - SPAでのページ遷移時の認証チェック
 * - リアルタイム認証状態更新
 *
 * 注意事項:
 * - サーバーサイド環境では使用不可
 * - ネットワーク通信が発生するため遅延あり
 *
 * @returns Promise<string | null> 有効なJWTトークン、無効/不在の場合はnull
 */
export async function getClientSession(): Promise<string | null> {
  // サーバーサイド環境では使用不可
  if (typeof window === 'undefined') {
    console.warn('getClientSession called on server side');
    return null;
  }

  try {
    // 認証確認用APIエンドポイントにリクエスト
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      // HTTPOnlyクッキーを含めるためcredentials: 'include'必須
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // レスポンスが成功（200 OK）の場合
    if (response.ok) {
      // AuthorizationヘッダーからJWTトークンを抽出
      const authHeader = response.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7); // "Bearer "プレフィックスを除去
      }
    }

    // 401 Unauthorizedやその他のエラーレスポンスの場合
    return null;
  } catch (error) {
    // ネットワークエラーやAPI障害をハンドリング
    console.warn('Failed to verify client session:', error);
    return null;
  }
}

/**
 * HTTPOnlyクッキーにJWTトークンを設定
 *
 * ログイン成功時にサーバーレスポンスでJWTトークンを
 * 安全なHTTPOnlyクッキーとして設定します。
 *
 * クッキー設定:
 * - HttpOnly: JavaScriptからアクセス不可（XSS対策）
 * - Path=/: 全パスでクッキーが有効
 * - SameSite=Strict: CSRF攻撃防止
 * - Max-Age: 7日間の有効期限
 * - Secure: 本番環境でHTTPS必須
 *
 * 使用場面:
 * - ログインAPI成功時
 * - トークンリフレッシュ時
 * - Remember me機能実装時
 *
 * @param response - HTTPレスポンスオブジェクト
 * @param jwt - 設定するJWTトークン
 */
export function setJwtCookie(response: Response, jwt: string): void {
  // セキュアなクッキー設定を構築
  const cookieOptions = [
    `auth-token=${jwt}`,
    'HttpOnly', // XSS攻撃防止
    'Path=/', // 全パスで有効
    'SameSite=Strict', // CSRF攻撃防止
    `Max-Age=${60 * 60 * 24 * 7}`, // 7日間有効
    // 本番環境でのみSecure属性を追加（HTTPS必須）
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ];

  const cookie = cookieOptions.join('; ');
  response.headers.append('Set-Cookie', cookie);
}

/**
 * HTTPOnlyクッキーからJWTトークンを削除（ログアウト処理）
 *
 * ログアウト時にクッキーを即座に無効化して
 * セキュリティリスクを最小化します。
 *
 * 削除方法:
 * - Max-Age=0により即座に期限切れに設定
 * - 値を空文字列にクリア
 * - 同じパスとドメインで上書き
 *
 * 使用場面:
 * - ログアウト処理
 * - セッション強制終了
 * - セキュリティインシデント対応
 *
 * @param response - HTTPレスポンスオブジェクト
 */
export function clearJwtCookie(response: Response): void {
  // クッキー削除用の設定を構築
  const cookieOptions = [
    'auth-token=', // 値を空にクリア
    'HttpOnly',
    'Path=/',
    'SameSite=Strict',
    'Max-Age=0', // 即座に期限切れ
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ];

  const cookie = cookieOptions.join('; ');
  response.headers.append('Set-Cookie', cookie);
}
