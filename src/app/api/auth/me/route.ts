import { getServerSession } from '@/lib/auth/session';
import { verifyTokenWithAuthServer } from '@/lib/auth/tokenVerification';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * 現在認証されているユーザーの情報を取得
 * httpOnlyのcookieからJWTを読み取り、認証サーバーで検証
 */
export async function GET(request: NextRequest) {
  try {
    // httpOnlyのcookieからJWTを取得
    const jwt = await getServerSession();

    if (!jwt) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // JWTの有効性を検証
    const { isValid, isExpired, user } = await verifyTokenWithAuthServer(jwt);

    if (!isValid) {
      // 無効または期限切れの場合
      const response = NextResponse.json(
        { error: isExpired ? 'Token expired' : 'Invalid token' },
        { status: 401 }
      );

      // 無効なJWTをクリア
      if (isExpired) {
        response.cookies.set('auth-token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0,
        });
      }

      return response;
    }

    // 有効な場合、ユーザー情報とJWTを返す
    const response = NextResponse.json({ user }, { status: 200 });

    // フロントエンドでJWTの存在を確認できるよう、Authorizationヘッダーに設定
    response.headers.set('Authorization', `Bearer ${jwt}`);

    return response;
  } catch (error) {
    console.error('Authentication check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
