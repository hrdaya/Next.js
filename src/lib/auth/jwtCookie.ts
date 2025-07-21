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

import { BACKEND_API_URL } from '@/constants';
import { cookies } from 'next/headers';

/**
 * JWTトークンを保存するHTTPOnlyクッキーのキー名
 *
 * この定数を変更することで、アプリケーション全体で使用される
 * JWTクッキー名を一括で変更できます。
 */
const JWT_COOKIE_NAME = 'auth-token';

/**
 * JWTクッキーの共通オプションを構築する内部ヘルパー関数
 *
 * setJwtCookieとclearJwtCookieで共通するクッキー属性を生成します。
 *
 * @param value - クッキーの値（JWTトークンまたは空文字列）
 * @param extraOptions - 追加のクッキーオプション（Max-Ageなど）
 * @returns 構築されたクッキー文字列
 */
function buildJwtCookieString(
  value: string,
  extraOptions: string[] = []
): string {
  const cookieOptions = [
    `${JWT_COOKIE_NAME}=${value}`,
    'HttpOnly', // XSS攻撃防止
    'Path=/', // 全パスで有効
    'SameSite=Strict', // CSRF攻撃防止
    ...extraOptions, // 追加オプション（Max-Ageなど）
    // 本番環境でのみSecure属性を追加（HTTPS必須）
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ];

  return cookieOptions.join('; ');
}

/**
 * レスポンスにJWTクッキーを設定する内部ヘルパー関数
 *
 * @param response - HTTPレスポンスオブジェクト
 * @param cookieString - 設定するクッキー文字列
 */
function appendJwtCookie(response: Response, cookieString: string): void {
  response.headers.append('Set-Cookie', cookieString);
}

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
 * @param jwt - 直接指定するJWTトークン（最優先）
 * @returns Promise<string | null> JWTトークン、存在しない場合はnull
 * @throws エラーが発生した場合はnullを返す（ログは出力）
 */
export async function getJwtCookie(jwt?: string): Promise<string | null> {
  // 引数で直接JWTが渡された場合は最優先で使用
  if (jwt) {
    return jwt;
  }

  try {
    // Next.js 15の非同期クッキーAPIを使用
    const cookieStore = await cookies();
    const token = cookieStore.get(JWT_COOKIE_NAME);
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
 * - セッションクッキー: ブラウザを閉じるまで有効
 * - Secure: 本番環境でHTTPS必須
 *
 * 使用場面:
 * - ログインAPI成功時
 * - トークンリフレッシュ時
 * - Remember me機能実装時
 *
 * @param response - HTTPレスポンスオブジェクト
 * @param jwt - 設定するJWTトークン
 * @param expiresIn - クッキーの有効期限（秒数）
 */
export function setJwtCookie(
  response: Response,
  jwt: string,
  expiresIn?: number
): void {
  // 有効期限が指定されている場合はMax-Ageオプションを追加（0を含む）
  const extraOptions = expiresIn === undefined ? [] : [`Max-Age=${expiresIn}`];

  // JWTトークンを含むセキュアなクッキー文字列を構築
  const cookieString = buildJwtCookieString(jwt, extraOptions);

  // レスポンスヘッダーにクッキーを設定
  appendJwtCookie(response, cookieString);
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
  // クッキー削除用の文字列を構築（空の値とMax-Age=0）
  const cookieString = buildJwtCookieString('', ['Max-Age=0']);

  // レスポンスヘッダーにクッキー削除設定を追加
  appendJwtCookie(response, cookieString);
}

/**
 * レスポンスからJWTを抽出してhttpOnlyクッキーに保存し、ヘッダーから削除
 *
 * バックエンドAPIからのレスポンスヘッダーに含まれるAuthorizationヘッダーを確認し、
 * JWTトークンが含まれている場合はhttpOnlyクッキーに保存してレスポンスヘッダーから削除します。
 * レスポンスオブジェクトは参照渡しのため直接変更され、返却は不要です。
 *
 * 処理フロー:
 * 1. レスポンスヘッダーからAuthorizationヘッダーを取得
 * 2. Bearer形式のJWTトークンを抽出
 * 3. JWTをhttpOnlyクッキーに設定
 * 4. レスポンスヘッダーからAuthorizationを削除
 *
 * セキュリティ機能:
 * - JWTがクライアントサイドJavaScriptからアクセス不可
 * - httpOnlyクッキーでXSS攻撃を防止
 * - SameSite=StrictでCSRF攻撃を防止
 *
 * @param response - 処理対象のレスポンスオブジェクト（直接変更される）
 * @param isGetAccessTokenUrl - アクセストークン取得URLかどうかのフラグ
 * @returns Promise<string | null> 抽出されたJWTトークン、存在しない場合はnull
 */
export async function secureJwtResponse(
  response: Response,
  isGetAccessTokenUrl: boolean
): Promise<string | null> {
  // レスポンスヘッダーからAuthorizationを取得
  // バックエンドからのレスポンスにAuthorizationヘッダーが含まれている場合はcookieに保存してヘッダを削除
  const authHeader = response.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // Bearer プレフィックスを除去してJWTトークンを抽出
    const jwt = authHeader.substring(7); // 'Bearer '.length = 7

    if (jwt) {
      // AuthorizationヘッダーをResponseから削除
      response.headers.delete('Authorization');

      // JWTをhttpOnlyクッキーに設定
      setJwtCookie(response, jwt);

      return jwt;
    }

    // JWTが空文字列の場合はnullを返す
    return null;
  }

  // アクセストークン（jwt）をレスポンスするURLの場合
  if (isGetAccessTokenUrl) {
    // レスポンスヘッダーにContent-Typeがapplication/jsonの場合のみ処理
    if (!response.headers.get('Content-Type')?.includes('application/json')) {
      return null;
    }

    // JSONレスポンスをパースしてJWTを抽出
    const json = await response.json().catch(() => ({}));

    // JSONからJWTトークンを取得
    const jwt = json?.access_token || '';

    // 有効期限（秒）を取得
    const expiresIn = json?.expires_in || undefined;

    if (jwt) {
      // JWTをhttpOnlyクッキーに設定
      setJwtCookie(response, jwt, expiresIn);

      return jwt;
    }
  }

  // JWTが含まれていない場合はnullを返す
  return null;
}

/**
 * リクエストヘッダーにJWT認証トークンを設定
 *
 * httpOnlyクッキーから取得したJWTトークンをBearerヘッダーとして設定します。
 * プロキシリクエストでバックエンドAPIにJWT認証情報を安全に転送するために使用されます。
 *
 * @param headers - 設定先のヘッダーオブジェクト
 * @returns Promise<void> JWTが設定された場合のみヘッダーが更新される
 */
export async function setJwtAuthHeader(
  headers: Record<string, string>
): Promise<void> {
  const jwt = await getJwtCookie();
  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }
}

/**
 * JWTトークンのリフレッシュを試行する汎用関数
 *
 * 401エラー時にバックエンドの/api/refreshエンドポイントを呼び出して
 * 新しいJWTトークンの取得を試行します。
 *
 * @param originalRequestOptions - 元のリクエストオプション
 * @returns Promise<{ success: boolean; jwt: string | null; response?: Response }>
 *          リフレッシュ結果と新しいJWT、必要に応じてレスポンス
 */
export async function tryRefreshJwt(
  originalRequestOptions: RequestInit
): Promise<{ success: boolean; jwt: string | null; response?: Response }> {
  try {
    // リフレッシュ用のオプションを作成（GETリクエスト、ボディは除去）
    const refreshOptions: RequestInit = {
      ...originalRequestOptions,
      method: 'GET',
      body: undefined, // GETリクエストなのでボディは不要
    };

    // リフレッシュAPIを呼び出して新しいトークンを取得
    const refreshResponse = await fetch(
      `${BACKEND_API_URL}/api/refresh`,
      refreshOptions
    );

    if (refreshResponse.status === 200) {
      // JWTを抽出してクッキーに保存
      const jwt = await secureJwtResponse(refreshResponse, true);

      return {
        success: true,
        jwt: jwt,
        response: refreshResponse,
      };
    }

    return {
      success: false,
      jwt: null,
      response: refreshResponse,
    };
  } catch (error) {
    console.error('JWT refresh failed:', error);
    return {
      success: false,
      jwt: null,
    };
  }
}
