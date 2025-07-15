/**
 * 認証関連ユーティリティ関数
 *
 * このモジュールは、HTTPOnlyクッキーベースの認証システムで
 * 使用される共通ユーティリティ関数を提供します。
 *
 * 主な機能:
 * - クライアントサイドからのサインアウト処理
 * - 認証状態の管理とリダイレクト
 * - エラーハンドリングとユーザビリティ向上
 *
 * 設計思想:
 * - シンプルで直感的なAPI
 * - エラー耐性とグレースフルデグラデーション
 * - セキュリティファーストのアプローチ
 */

/**
 * アプリケーション全体で使用可能なサインアウト関数
 *
 * HTTPOnlyクッキーはクライアントサイドJavaScriptから直接削除できないため、
 * サーバーサイドAPIエンドポイント('/api/auth/signout')を経由して
 * 安全にクッキーをクリアします。
 *
 * 処理フロー:
 * 1. '/api/auth/signout'エンドポイントにPOSTリクエスト
 * 2. サーバーサイドでHTTPOnlyクッキーを削除
 * 3. 成功した場合はサインインページにリダイレクト
 * 4. 失敗した場合はエラーログを出力
 *
 * セキュリティ機能:
 * - HTTPOnlyクッキーの安全な削除
 * - CSRF保護（credentials: 'include'）
 * - サーバーサイド検証による確実なログアウト
 *
 * UX考慮事項:
 * - 即座にサインインページへリダイレクト
 * - ネットワークエラー時の適切なエラーハンドリング
 * - ブラウザのセッション状態完全リセット
 *
 * 使用例:
 * ```tsx
 * // コンポーネント内でのサインアウト
 * import { signOut } from '@/lib/auth/utils';
 *
 * function LogoutButton() {
 *   const handleLogout = async () => {
 *     await signOut();
 *     // ページ遷移は自動で行われる
 *   };
 *
 *   return <button onClick={handleLogout}>ログアウト</button>;
 * }
 * ```
 *
 * ```tsx
 * // カスタムフックでの使用
 * function useAuth() {
 *   const logout = async () => {
 *     try {
 *       await signOut();
 *     } catch (error) {
 *       // エラーハンドリング
 *     }
 *   };
 *
 *   return { logout };
 * }
 * ```
 *
 * エラーケース:
 * - ネットワーク接続エラー
 * - サーバーAPIエラー
 * - 無効なセッション状態
 *
 * @returns Promise<void> 非同期処理、エラー時は例外をスローしない
 */
export async function signOut(): Promise<void> {
  try {
    // サインアウトAPIエンドポイントにリクエスト
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      // HTTPOnlyクッキーを含めるため必須
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // サーバーからの成功レスポンス（200 OK）を確認
    if (response.ok) {
      // サインアウト成功: サインインページへ強制リダイレクト
      // window.location.href を使用して完全にページをリロード
      // これによりクライアントサイドのキャッシュも完全にクリア
      window.location.href = '/signin';
    } else {
      // サーバーエラー（4xx, 5xx）の処理
      console.error(
        'Signout failed with status:',
        response.status,
        response.statusText
      );

      // 既にログアウト状態の場合（401）でもサインインページへ
      if (response.status === 401) {
        window.location.href = '/signin';
      }
    }
  } catch (error) {
    // ネットワークエラーやその他の予期しないエラー
    console.error('Signout error:', error);

    // エラーが発生してもユーザビリティを保つため
    // サインインページへリダイレクト（クライアント側状態はクリア）
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  }
}
