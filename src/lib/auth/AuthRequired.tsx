/**
 * 認証が必要なページ用のラッパーコンポーネント
 *
 * このコンポーネントは、認証が必要なページを保護するために使用されます。
 * サーバーサイドレンダリング時に認証状態をチェックし、
 * 未認証ユーザーを適切にハンドリングします。
 *
 * 機能:
 * - HTTPオンリーCookieからJWTトークンを取得
 * - JWTの有効性をローカルで検証（パフォーマンス最適化）
 * - 無効/期限切れの場合は401ページを表示
 * - 有効な場合はページコンテンツをレンダリング
 *
 * セキュリティ考慮事項:
 * - JWTの署名検証はサーバーサイドでのみ実行
 * - 有効期限チェックはクライアントサイドでも安全に実行可能
 * - HTTPオンリーCookieによりXSS攻撃を防止
 */

import { unauthorized } from 'next/navigation';
import { verifyTokenLocally } from './jwt';
import { getJwtCookie, tryRefreshJwt } from './jwtCookie';

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
 * 3. JWTの有効期限をローカルでチェック
 * 4. 無効/期限切れの場合は401エラーを返す
 * 5. 有効な場合は子コンポーネントをレンダリング
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
  const jwt = await getJwtCookie();

  // JWTトークンが存在しない場合（未ログイン状態）
  if (!jwt) {
    // Next.js の unauthorized() 関数を呼び出して401ページを表示
    unauthorized();
  }

  // JWTトークンの有効性をローカルで検証
  // - パフォーマンス最適化のため、外部サーバーへの問い合わせは行わない
  // - 有効期限のチェックのみを実行（署名検証はログイン時に完了済み）
  const { isValid, isExpired } = verifyTokenLocally(jwt);

  // JWTが無効または期限切れの場合
  if (!isValid || isExpired) {
    // JWTリフレッシュを試行
    try {
      const newJwt = await tryRefreshJwt({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (newJwt) {
        // リフレッシュ成功：認証成功として処理を続行
        // 注意: リフレッシュしたJWTは既にクッキーに保存済みで、有効性も保証済み
        return <>{children}</>;
      }
    } catch (error) {
      console.error('JWT refresh failed in AuthRequired:', error);
    }

    // リフレッシュが失敗した場合、または新しいJWTも無効な場合
    // 401 Unauthorizedページを表示（ユーザーは再ログインが必要）
    unauthorized();
  }

  // 認証チェックが全て成功した場合
  // 子コンポーネント（ページコンテンツ）をレンダリング
  return <>{children}</>;
}
