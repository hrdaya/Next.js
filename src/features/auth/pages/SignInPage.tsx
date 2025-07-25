'use client';

import { useApiRequest } from '@/hooks';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SignInForm } from '../ui/SignInForm';

/**
 * サインインフォームのデータ型定義
 */
interface SignInFormData {
  email: string;
  password: string;
}

interface SinInResponse {
  name: string;
}

/**
 * 認証ページの共通コンポーネント
 *
 * サインイン処理の実装を含む完全な認証ページを提供します：
 * - フォーム送信処理
 * - ローディング状態管理
 * - エラーハンドリング
 * - 成功時のリダイレクト
 */
export function SignInPage() {
  // 多言語化フック
  const { t } = useTranslation('auth');

  // ナビゲーション用のルーター
  const router = useRouter();

  // 現在のパス名を取得
  const pathname = usePathname();

  // ローディング状態の管理
  const [isLoading, setIsLoading] = useState(false);

  // エラーメッセージの管理
  const [error, setError] = useState<string>('');

  // Proxy経由のAPIリクエストフック
  const api = useApiRequest();

  /**
   * サインイン処理のハンドラー
   * フォームデータを受け取って認証APIを呼び出します
   */
  const handleSignIn = async (formData: SignInFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // サインインAPIの呼び出し
      const result = await api.create<SinInResponse, SignInFormData>(
        '/login',
        formData,
        t('systemError')
      );

      if (result.ok && !result.errors) {
        // /signinページの場合はホームページにリダイレクト
        if (pathname === '/signin') {
          router.push('/');
        } else {
          // その他のページの場合は画面をリロード
          window.location.reload();
        }
      } else {
        // エラー時の処理
        setError(t('signInFailed'));
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignInForm onSubmit={handleSignIn} isLoading={isLoading} error={error} />
  );
}
