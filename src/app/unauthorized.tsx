/**
 * @fileoverview 認証エラー（401 Unauthorized）ページ
 *
 * このファイルは、認証が必要なリソースへの未認証アクセス時に表示されるページを定義しています。
 * Next.js App Routerの特殊ページとして機能し、以下の場面で自動的に表示されます：
 *
 * 表示タイミング：
 * - useApiRequestフック内でHTTP 401エラーが発生した場合
 * - AuthRequiredコンポーネントで認証チェックに失敗した場合
 * - サーバーサイドでunauthorized()関数が呼び出された場合
 * - JWTトークンの有効期限切れや不正なトークンでのアクセス時
 *
 * 機能：
 * - ユーザーフレンドリーな認証エラーメッセージの表示
 * - サインインフォームの提供（SignInPageコンポーネント経由）
 * - 自動的なサインアウト処理（既存の無効セッションのクリア）
 * - 国際化対応（メタデータと画面表示）
 *
 * セキュリティ考慮：
 * - 認証失敗理由の詳細は隠蔽（情報漏洩防止）
 * - 既存の無効セッションの確実なクリア
 * - ログイン後の適切なリダイレクト処理
 *
 * @route /unauthorized
 * @security Handles authentication failures, session cleanup
 * @accessibility Provides clear messaging for authentication requirements
 */

import { SignInPage } from '@/features/auth/components';
import { getServerTranslation } from '@/lib/i18n/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const title = await getServerTranslation('errors:unauthorized.title');

  return {
    title: title,
  };
}

/**
 * 認証エラーページのメインコンポーネント
 *
 * HTTP 401 Unauthorizedエラー時に表示されるNext.js App Routerの特殊ページです。
 * SignInPageコンポーネントを再利用することで、一貫したUI/UXを提供します。
 *
 * 動作フロー：
 * 1. 認証が必要なリソースへの未認証アクセス発生
 * 2. useApiRequestフックまたはAuthRequiredコンポーネントで401エラーを検出
 * 3. next/navigationのunauthorized()関数が呼び出される
 * 4. このページが自動的に表示される
 * 5. ユーザーは認証情報を入力してサインイン
 * 6. 認証成功後、元のページまたはダッシュボードにリダイレクト
 *
 * SignInPageコンポーネントの特徴：
 * - サインインフォームの提供
 * - 国際化対応（エラーメッセージの多言語化）
 * - バリデーション機能
 * - セキュアな認証処理（プロキシAPI経由）
 * - 既存セッションの適切なクリア処理
 *
 * @returns JSX.Element - 認証フォームを含むページコンポーネント
 *
 * @example
 * // 以下の場面でこのページが表示されます：
 *
 * // 1. APIリクエストで401エラー時
 * const api = useApiRequest();
 * const response = await api.get('/api/protected-resource');
 * // → 401の場合、自動的に unauthorized() が呼ばれてこのページが表示
 *
 * // 2. ミドルウェアでの認証チェック失敗時
 * // AuthRequired コンポーネントで JWT検証に失敗 → このページが表示
 *
 * // 3. サーバーサイドでの認証エラー時
 * // サーバーコンポーネントで unauthorized() 呼び出し → このページが表示
 */
export default function Page() {
  return <SignInPage />;
}
