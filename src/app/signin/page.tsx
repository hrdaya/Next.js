import { SignInPage } from '@/features/auth/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン',
};

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
