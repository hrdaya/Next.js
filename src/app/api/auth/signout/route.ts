import { getServerSession } from '@/lib/auth/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const jwt = await getServerSession();
    const authServerUrl = process.env.BACKEND_API_URL;

    // 外部認証サーバーにログアウト通知
    if (authServerUrl && jwt) {
      try {
        await fetch(`${authServerUrl}/auth/signout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
          cache: 'no-store',
        });
      } catch (error) {
        console.error('Auth server signout error:', error);
        // 外部サーバーエラーでもローカルのCookieは削除する
      }
    }

    const response = NextResponse.json({ success: true });

    // httpOnlyのCookieを削除
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signout error:', error);

    // エラーが発生してもCookieは削除
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}
