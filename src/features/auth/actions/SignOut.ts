'use server';

import { BACKEND_API_URL } from '@/constants';
import { getJwtCookie } from '@/lib/auth/jwtCookie';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * サーバーアクション: ログアウト処理
 *
 * この関数は、フォーム送信やボタンクリックから呼び出されるサーバーアクションです。
 * バックエンドのログアウトAPIを呼び出し、JWTクッキーを削除してサインイン画面にリダイレクトします。
 *
 * 処理フロー:
 * 1. 現在のJWTトークンをクッキーから取得
 * 2. バックエンドの/api/logoutエンドポイントにPOSTリクエストを送信
 * 3. JWTクッキーを削除
 * 4. サインイン画面にリダイレクト
 *
 * セキュリティ考慮事項:
 * - バックエンドエラーが発生してもローカルクッキーは必ず削除
 * - サーバーアクションのため、CSRF攻撃に対して安全
 * - HTTPOnlyクッキーの安全な削除
 *
 * 使用例:
 * ```tsx
 * import { signOutAction } from '@/features/auth/actions/SignOut';
 *
 * export function LogoutButton() {
 *   return (
 *     <form action={signOutAction}>
 *       <button type="submit">ログアウト</button>
 *     </form>
 *   );
 * }
 * ```
 */
export async function signOutAction(): Promise<void> {
  try {
    // 現在のJWTトークンを取得
    const jwt = await getJwtCookie();

    // バックエンドのログアウトAPIを呼び出し
    if (jwt) {
      try {
        await fetch(`${BACKEND_API_URL}/api/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
          cache: 'no-store',
        });
      } catch (error) {
        console.error('Backend logout API error:', error);
        // バックエンドエラーでもローカルのクッキー削除は継続
      }
    }
  } catch (error) {
    console.error('Logout action error:', error);
    // エラーが発生してもログアウト処理は継続
  } finally {
    // 成功・エラーに関わらず、常にJWTクッキーを削除
    await clearJwtCookieAction();
  }

  // サインイン画面にリダイレクト
  redirect('/signin');
}

/**
 * JWTクッキーを削除するヘルパー関数
 *
 * サーバーアクション内でクッキーを安全に削除します。
 * Next.js 15の非同期クッキーAPIを使用してHTTPOnlyクッキーを削除します。
 *
 * @throws エラーが発生した場合はログを出力するが、処理は継続
 */
async function clearJwtCookieAction(): Promise<void> {
  try {
    const cookieStore = await cookies();

    // JWTクッキーを削除
    // expires: new Date(0) で過去の日時を設定してクッキーを期限切れにする
    cookieStore.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // 即座に期限切れ
    });
  } catch (error) {
    console.error('Failed to clear JWT cookie:', error);
    // クッキー削除エラーでもログアウト処理は継続
  }
}
