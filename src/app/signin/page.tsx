import { SignInPage } from '@/features/auth/components';
import { getServerTranslation } from '@/lib/i18n/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const title = await getServerTranslation('auth:signInTitle');

  return {
    title: title,
  };
}

/**
 * サインインページ
 *
 * ログイン状態に応じて以下の処理を行います：
 * - ログイン済み（/signinページから）: ホームページ（/）にリダイレクト
 * - ログイン済み（その他のページから）: 画面をリロード
 * - 未ログイン: サインインフォームを表示
 */
export default async function SigninPage() {
  return <SignInPage />;
}
