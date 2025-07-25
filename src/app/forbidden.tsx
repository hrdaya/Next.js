/**
 * @fileoverview 認可エラー（403 Forbidden）ページ
 *
 * このファイルは、認証済みユーザーが権限不足でアクセス拒否された際に表示されるページを定義しています。
 * Next.js App Routerの特殊ページとして機能し、以下の場面で自動的に表示されます：
 *
 * 表示タイミング：
 * - useApiRequestフック内でHTTP 403エラーが発生した場合
 * - サーバーサイドでforbidden()関数が呼び出された場合
 * - 認証済みだが、特定のリソースへのアクセス権限がない場合
 * - ロールベースアクセス制御（RBAC）で権限チェックに失敗した場合
 * - 管理者専用機能への一般ユーザーアクセス時
 *
 * 401 Unauthorizedとの違い：
 * - 401: 認証が必要（ログインしていない）→ サインインページ
 * - 403: 認証済みだが権限不足（ログイン済みだがアクセス禁止）→ このページ
 *
 * 機能：
 * - ユーザーフレンドリーなアクセス禁止メッセージの表示
 * - 権限不足の理由説明（セキュリティに配慮した範囲で）
 * - 適切なナビゲーションオプションの提供
 * - 国際化対応（メタデータと画面表示）
 *
 * セキュリティ考慮：
 * - 権限不足の詳細理由は隠蔽（情報漏洩防止）
 * - システム内部構造の情報漏洩防止
 * - 適切なHTTPステータスコード設定
 *
 * ユーザビリティ：
 * - 混乱を避けるための明確なメッセージ
 * - 次に取るべきアクションの提示
 * - ホームページやダッシュボードへの導線
 *
 * @route /forbidden
 * @security Handles authorization failures while protecting system information
 * @accessibility Provides clear messaging for permission requirements
 */

import { ForbiddenPage } from '@/features/errors/components/ForbiddenPage';
import { getServerTranslation } from '@/lib/i18n/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const title = await getServerTranslation('errors:forbidden.title');
  const description = await getServerTranslation(
    'errors:forbidden.description'
  );

  return {
    title: title,
    description: description,
  };
}

/**
 * 403 Forbiddenページのメインコンポーネント
 *
 * HTTP 403 Forbiddenエラー時に表示されるNext.js App Routerの特殊ページです。
 * ForbiddenPageコンポーネントを使用して、一貫したエラーページUIを提供します。
 *
 * 動作フロー：
 * 1. 認証済みユーザーが権限不足のリソースにアクセス
 * 2. バックエンドAPIまたはミドルウェアで権限チェック失敗（403エラー）
 * 3. useApiRequestフックまたはサーバーサイドでHTTP 403を検出
 * 4. next/navigationのforbidden()関数が呼び出される
 * 5. このページが自動的に表示される
 * 6. ユーザーは適切なナビゲーションで他のページに移動
 *
 * 権限チェックのシナリオ例：
 * - 管理者専用ページへの一般ユーザーアクセス
 * - 他部署のデータへの不正アクセス試行
 * - 無効化されたアカウントでの機能利用試行
 * - ロールベースアクセス制御（RBAC）での権限不足
 * - リソース所有者以外からのアクセス（例：他人の個人情報）
 *
 * ForbiddenPageコンポーネントの特徴：
 * - セキュリティ配慮したメッセージ表示（詳細な理由は隠蔽）
 * - ユーザーフレンドリーな説明とナビゲーション
 * - 国際化対応（エラーメッセージの多言語化）
 * - アクセシビリティ考慮（スクリーンリーダー対応等）
 * - 統一されたエラーページデザイン
 *
 * セキュリティ実装：
 * - 権限不足の具体的理由は表示しない（情報漏洩防止）
 * - システム内部構造の隠蔽
 * - 攻撃者への有用な情報提供を回避
 *
 * @returns JSX.Element - 権限不足メッセージを含むページコンポーネント
 *
 * @example
 * // 以下の場面でこのページが表示されます：
 *
 * // 1. APIリクエストで403エラー時
 * const api = useApiRequest();
 * const response = await api.get('/api/admin/users');
 * // → 403の場合、自動的に forbidden() が呼ばれてこのページが表示
 *
 * // 2. ミドルウェアでの権限チェック失敗時
 * // AuthRequired コンポーネントでロール確認に失敗 → このページが表示
 *
 * // 3. サーバーサイドでの権限エラー時
 * // サーバーコンポーネントで forbidden() 呼び出し → このページが表示
 *
 * // 4. ロールベースアクセス制御での権限不足
 * // 管理者権限が必要な機能に一般ユーザーがアクセス → このページが表示
 */
export default function Page() {
  return <ForbiddenPage />;
}
