/**
 * 認証が必要なページ用のラッパーコンポーネント
 *
 * このコンポーネントは、認証が必要なページを保護するために使用されます。
 * サーバーサイドレンダリング時に認証状態をチェックし、
 * 未認証ユーザーを適切にハンドリングします。
 */

import { unauthorized } from 'next/navigation';
import { getJwtFromCookie } from './jwt';

/**
 * AuthRequiredコンポーネントのプロパティ
 */
interface AuthRequiredProps {
  /** 認証が成功した場合にレンダリングされる子コンポーネント */
  children: React.ReactNode;
}

/**
 * 認証が必要なページのラッパーコンポーネント
 *
 * このコンポーネントは以下の流れで認証をチェックします:
 * 1. HTTPオンリーCookieからJWTトークンを取得
 * 2. JWTが存在しない場合は401エラーを返す
 * 3. 有効な場合は子コンポーネントをレンダリング
 *
 * 使用例:
 * ```tsx
 * // プロテクトしたいページをラップ
 * export default async function ProtectedPage() {
 *   return (
 *     <AuthRequired>
 *       <div>
 *         <h1>認証が必要なページ</h1>
 *         <p>このコンテンツはログインユーザーのみが閲覧できます</p>
 *       </div>
 *     </AuthRequired>
 *   );
 * }
 * ```
 *
 * @param props - コンポーネントのプロパティ
 * @returns 認証が成功した場合は子コンポーネント、失敗した場合は401エラー
 */
export default async function AuthRequired({ children }: AuthRequiredProps) {
  // サーバーサイドでHTTPオンリーCookieからJWTトークンを取得
  // この処理はサーバーサイドでのみ実行され、クライアントからは直接アクセス不可
  const jwt = await getJwtFromCookie();

  // JWTトークンが存在しない場合（未ログイン状態）
  if (!jwt) {
    // Next.js の unauthorized() 関数を呼び出して401ページを表示
    unauthorized();
  }

  // 認証チェックが全て成功した場合
  // 子コンポーネント（ページコンテンツ）をレンダリング
  return <>{children}</>;
}
