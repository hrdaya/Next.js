/**
 * JWT関連のユーティリティ関数
 * ローカルでのJWT有効期限チェック機能を提供
 */

/**
 * JWT payload の型定義
 */
interface JWTPayload {
  exp: number; // 有効期限 (Unix timestamp)
  iat: number; // 発行時刻 (Unix timestamp)
  sub?: string; // subject (通常はユーザーID)
  email?: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Base64URLエンコードされた文字列をデコードします
 * @param base64url - Base64URLエンコードされた文字列
 * @returns デコードされた文字列
 */
function base64UrlDecode(base64url: string): string {
  // Base64URL から Base64 に変換
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

  // パディングを追加
  switch (base64.length % 4) {
    case 2:
      base64 += '==';
      break;
    case 3:
      base64 += '=';
      break;
  }

  return atob(base64);
}

/**
 * JWTトークンをデコードしてペイロードを取得します
 * @param token - JWTトークン
 * @returns デコードされたペイロード
 * @throws JWT形式が無効な場合はエラーをスロー
 */
export function decodeJWT(token: string): JWTPayload {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  try {
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload) as JWTPayload;
  } catch (error) {
    throw new Error('Failed to decode JWT payload');
  }
}

/**
 * JWTトークンの有効期限をチェックします
 * @param token - 検証するJWTトークン
 * @returns トークンが有効期限内かどうか
 */
export function isJWTValid(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    const currentTime = Math.floor(Date.now() / 1000); // 現在時刻（Unix timestamp）

    // exp (expiration time) が現在時刻より後であれば有効
    return payload.exp > currentTime;
  } catch (error) {
    // JWT のデコードに失敗した場合は無効
    return false;
  }
}

/**
 * JWTトークンが期限切れかどうかをチェックします
 * @param token - 検証するJWTトークン
 * @returns トークンが期限切れかどうか
 */
export function isJWTExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    const currentTime = Math.floor(Date.now() / 1000);

    // exp (expiration time) が現在時刻より前であれば期限切れ
    return payload.exp <= currentTime;
  } catch (error) {
    // JWT のデコードに失敗した場合は期限切れとして扱う
    return true;
  }
}

/**
 * JWTトークンから有効期限の残り時間（秒）を取得します
 * @param token - JWTトークン
 * @returns 有効期限までの残り時間（秒）、無効な場合は0
 */
export function getJWTExpirationTime(token: string): number {
  try {
    const payload = decodeJWT(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = payload.exp - currentTime;

    return Math.max(0, remainingTime);
  } catch (error) {
    return 0;
  }
}

/**
 * JWTトークンからユーザー情報を取得します
 * @param token - JWTトークン
 * @returns ユーザー情報、無効な場合はnull
 */
export function getJWTUserInfo(
  token: string
): { id: string; email?: string; name?: string } | null {
  try {
    const payload = decodeJWT(token);

    return {
      id: payload.sub || '',
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    return null;
  }
}
