/**
 * 認証が必要なページ用のラッパーコンポーネント
 *
 * すべてのページでログインが必要な場合に使用
 * サーバーサイドでセッションをチェックし、ローカルでJWTの有効期限を検証
 * 未認証または期限切れの場合はunauthorized()を実行
 */

import { unauthorized } from 'next/navigation';
import { getServerSession } from './session';
import { verifyTokenLocally } from './tokenVerification';

interface AuthRequiredProps {
  children: React.ReactNode;
}

/**
 * 認証が必要なページのラッパーコンポーネント
 *
 * 使用例:
 * ```tsx
 * export default async function SomePage() {
 *   return (
 *     <AuthRequired>
 *       <div>認証が必要なコンテンツ</div>
 *     </AuthRequired>
 *   );
 * }
 * ```
 */
export default async function AuthRequired({ children }: AuthRequiredProps) {
  // セッションからJWTを取得
  const jwt = await getServerSession();

  // JWTが存在しない場合
  if (!jwt) {
    unauthorized();
  }

  // JWTの有効性をローカルで検証（外部サーバーへの問い合わせなし）
  const { isValid, isExpired } = verifyTokenLocally(jwt);

  if (!isValid || isExpired) {
    // 無効または期限切れの場合
    unauthorized();
  }

  // 認証が成功した場合、子コンポーネントをレンダリング
  return <>{children}</>;
}
