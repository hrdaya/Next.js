/**
 * 認証が必要なページ用のレイアウト
 * サインインページ以外のすべてのページで使用
 */

import AuthRequired from '@/lib/auth/AuthRequired';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthRequired>{children}</AuthRequired>;
}
