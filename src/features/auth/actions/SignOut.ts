'use server';

import { clearJwtCookie, getJwtFromCookie } from '@/lib/auth/jwt';
import { postServerData } from '@/utils/serverApiProxy';
import { redirect } from 'next/navigation';

/**
 * サーバーアクション: ログアウト処理
 *
 * この関数は、フォーム送信やボタンクリックから呼び出されるサーバーアクションです。
 * バックエンドのログアウトAPIを呼び出し、JWTクッキーを削除してサインイン画面にリダイレクトします。
 *
 * 処理フロー:
 * 1. バックエンドのログアウトエンドポイントにPOSTリクエストを送信
 * 2. JWTクッキーを削除
 * 3. サインイン画面にリダイレクト
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
    const jwt = await getJwtFromCookie();

    // バックエンドのログアウトAPIを呼び出し
    if (jwt) {
      postServerData<Response, Record<string, never>>('/logout');
    }
  } catch (error) {
    console.error('Logout action error:', error);
    // エラーが発生してもログアウト処理は継続
  } finally {
    // 成功・エラーに関わらず、常にJWTクッキーを削除
    await clearJwtCookie();
  }

  // サインイン画面にリダイレクト
  redirect('/');
}
