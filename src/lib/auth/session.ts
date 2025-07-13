/**
 * JWT Cookie管理ユーティリティ
 *
 * httpOnlyのcookieを使用してJWTを安全に管理
 */

import { cookies } from 'next/headers';

/**
 * サーバーサイドでJWTをhttpOnlyのcookieから取得
 */
export async function getServerSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    return token?.value || null;
  } catch (error) {
    console.warn('Failed to access server session:', error);
    return null;
  }
}

/**
 * クライアントサイドからはhttpOnlyのcookieは直接アクセスできないため
 * APIエンドポイント経由でJWTの存在確認を行う
 */
export async function getClientSession(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // httpOnlyのcookieを含める
    });

    if (response.ok) {
      // JWTが有効な場合は、レスポンスヘッダーからJWTを取得
      const authHeader = response.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to verify client session:', error);
    return null;
  }
}

/**
 * httpOnlyのcookieを設定するためのヘルパー関数
 * サーバーサイドのレスポンスでのみ使用可能
 */
export function setJwtCookie(response: Response, jwt: string): void {
  const cookie = `auth-token=${jwt}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}; ${
    process.env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`;

  response.headers.append('Set-Cookie', cookie);
}

/**
 * httpOnlyのcookieからJWTを削除
 */
export function clearJwtCookie(response: Response): void {
  const cookie = `auth-token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0; ${
    process.env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`;

  response.headers.append('Set-Cookie', cookie);
}
