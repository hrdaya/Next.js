import { getServerSession } from '@/lib/auth/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * バックエンドAPIへのプロキシ処理
 * - リクエスト時: httpOnlyのcookieからJWTを取得してBearerヘッダーに設定
 * - レスポンス時: レスポンスヘッダーのBearerをhttpOnlyのcookieに保存
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const { url, method = 'POST', body } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // セッションからJWTを取得
    const jwt = await getServerSession();

    // バックエンドにリクエスト送信
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // JWTが存在する場合はBearerヘッダーに設定
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }

    const backendResponse = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    // レスポンスボディを取得
    const responseData = await backendResponse.json().catch(() => ({}));

    // クライアントへのレスポンスを作成
    const clientResponse = NextResponse.json(responseData, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // レスポンスヘッダーからAuthorizationを取得
    const responseAuthHeader = backendResponse.headers.get('Authorization');

    // バックエンドからJWTが返された場合、httpOnlyのcookieに保存
    if (responseAuthHeader?.startsWith('Bearer ')) {
      const newJwt = responseAuthHeader.substring(7);

      // httpOnlyのcookieに保存
      clientResponse.cookies.set('auth-token', newJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7日間
      });

      // クライアントレスポンスのAuthorizationヘッダーは削除
      // （httpOnlyのcookieを使用するため、フロントエンドではアクセス不要）
    }

    return clientResponse;
  } catch (error) {
    console.error('Backend proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // クエリパラメータからパスを取得
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // セッションからJWTを取得
    const jwt = await getServerSession();

    // バックエンドにリクエスト送信
    const headers: Record<string, string> = {};

    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }

    const backendResponse = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    // レスポンスボディを取得
    const responseData = await backendResponse.json().catch(() => ({}));

    // クライアントへのレスポンスを作成
    const clientResponse = NextResponse.json(responseData, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // レスポンスヘッダーからAuthorizationを取得
    const responseAuthHeader = backendResponse.headers.get('Authorization');

    // バックエンドからJWTが返された場合、httpOnlyのcookieに保存
    if (responseAuthHeader?.startsWith('Bearer ')) {
      const newJwt = responseAuthHeader.substring(7);

      clientResponse.cookies.set('auth-token', newJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7日間
      });
    }

    return clientResponse;
  } catch (error) {
    console.error('Backend proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
