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
