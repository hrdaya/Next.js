import { BACKEND_API_URL } from '@/constants';
import { clearJwtCookie, getServerSession } from '@/lib/auth/session';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let response: NextResponse;

  try {
    const jwt = await getServerSession();

    // 外部認証サーバーにログアウト通知
    if (jwt) {
      try {
        await fetch(`${BACKEND_API_URL}/auth/signout`, {
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
  } catch (error) {
    console.error('Signout error:', error);
    // エラーが発生してもサインアウト処理は継続
  } finally {
    // 成功・エラーに関わらず、常にクッキーをクリアしてサインアウト完了を返す
    response = NextResponse.json({ success: true });
    clearJwtCookie(response);
  }

  return response;
}
