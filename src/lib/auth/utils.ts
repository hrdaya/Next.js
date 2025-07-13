/**
 * 認証関連のユーティリティ関数
 *
 * httpOnlyのcookieを使用した認証システム用のユーティリティ
 */

/**
 * どこからでも呼び出せるサインアウト関数
 * httpOnlyのcookieをクリアするため、APIエンドポイント経由で実行
 *
 * 使用例:
 * ```tsx
 * import { signOut } from '@/lib/auth/utils';
 *
 * const handleLogout = async () => {
 *   await signOut();
 * };
 * ```
 */
export async function signOut(): Promise<void> {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include', // httpOnlyのcookieを含める
    });

    if (response.ok) {
      // サインアウト成功後、ページをリロードして認証状態をリセット
      window.location.href = '/signin';
    } else {
      console.error('Signout failed:', response.statusText);
    }
  } catch (error) {
    console.error('Signout error:', error);
  }
}
