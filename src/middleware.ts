import { handleAuthentication } from '@/lib/auth/middleware';
import type { NextRequest } from 'next/server';

/**
 * Next.jsミドルウェアのメインエントリーポイント。
 * リクエスト毎に実行され、認証状態をチェックします。
 * @param request - 受信したNextRequestオブジェクト
 * @returns NextResponseオブジェクト
 */
export async function middleware(request: NextRequest) {
  // 認証ミドルウェアを実行
  return await handleAuthentication(request);
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};
