/**
 * @fileoverview 404 Not Foundページ
 *
 * このファイルは、存在しないページやリソースにアクセスした際に表示されるページを定義しています。
 * Next.js App Routerの特殊ページとして機能し、以下の場面で自動的に表示されます：
 *
 * 表示タイミング：
 * - 存在しないURLパスへのアクセス時
 * - useApiRequestフック内でHTTP 404エラーが発生した場合
 * - サーバーサイドでnotFound()関数が呼び出された場合
 * - ファイルやAPIエンドポイントが見つからない場合
 * - 動的ルートで該当するリソースが存在しない場合
 * - 削除されたページへの古いブックマークアクセス時
 *
 * 404エラーの種類：
 * - ページレベル404: 存在しないURL（/non-existent-page）
 * - リソースレベル404: 存在しないAPI（/api/non-existent）
 * - データレベル404: 存在しないID（/users/999999）
 * - ファイルレベル404: 存在しない静的ファイル
 *
 * 機能：
 * - ユーザーフレンドリーな「ページが見つかりません」メッセージ
 * - 適切なナビゲーションオプション（ホーム、検索等）
 * - SEO考慮（適切なHTTPステータスコード設定）
 * - 国際化対応（メタデータと画面表示）
 * - サイトマップやおすすめコンテンツの提示
 *
 * SEO影響：
 * - 検索エンジンに正しい404ステータスを返す
 * - ソフト404（200ステータスでの404コンテンツ）を回避
 * - 適切なcanonicalタグやnoindexの設定
 * - ユーザビリティ向上によるサイト評価維持
 *
 * ユーザー体験：
 * - 混乱を最小限に抑える明確なメッセージ
 * - 次のアクションへの明確な導線
 * - ブランドイメージを損なわないデザイン
 * - 検索機能やサイトマップの提供
 *
 * @route /not-found (自動表示)
 * @security Prevents information disclosure about non-existent resources
 * @accessibility Provides clear navigation alternatives for users
 * @seo Returns proper 404 HTTP status code for search engines
 */

import { NotFoundPage } from '@/features/errors/components/NotFoundPage';
import { getServerTranslation } from '@/lib/i18n/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const title = await getServerTranslation('errors:notFound.title');
  const description = await getServerTranslation('errors:notFound.description');

  return {
    title: title,
    description: description,
  };
}

/**
 * 404 Not Foundページのメインコンポーネント
 *
 * HTTP 404 Not Foundエラー時に表示されるNext.js App Routerの特殊ページです。
 * NotFoundPageコンポーネントを使用して、一貫したエラーページUIを提供します。
 *
 * 動作フロー：
 * 1. ユーザーが存在しないURLにアクセス、または存在しないリソースを要求
 * 2. Next.jsルーターまたはAPIで該当するページ/リソースが見つからない
 * 3. システムが自動的に404ステータスを検出
 * 4. next/navigationのnotFound()関数が呼び出される（必要に応じて）
 * 5. このページが自動的に表示される
 * 6. ユーザーは提供されたナビゲーションで適切なページに移動
 *
 * 404発生の一般的なシナリオ：
 * - 古いブックマークからのアクセス（削除されたページ）
 * - タイプミスによる間違ったURL入力
 * - 外部サイトからの古いリンク
 * - 動的ルートで存在しないIDアクセス（/users/999999）
 * - API呼び出しで存在しないエンドポイント
 * - 移転・統合されたページへのアクセス
 * - 検索エンジンの古いインデックスからのアクセス
 *
 * NotFoundPageコンポーネントの特徴：
 * - ユーザーフレンドリーなメッセージ表示
 * - 明確で分かりやすいナビゲーションオプション
 * - ホームページ、検索機能、人気コンテンツへのリンク
 * - ブランドに一貫したデザインとトーン
 * - 国際化対応（エラーメッセージの多言語化）
 * - アクセシビリティ考慮（スクリーンリーダー対応等）
 * - モバイルフレンドリーなレスポンシブデザイン
 *
 * SEOとパフォーマンス：
 * - 正確な404 HTTPステータスコードの返却
 * - ソフト404（200ステータス）の回避
 * - 適切なmetaタグ設定（noindex, nofollow）
 * - 高速なページ読み込み（エラーでも良好なUX）
 * - 構造化データでエラーページのマークアップ
 *
 * ユーザビリティ向上：
 * - 「お探しのページが見つかりません」等の親しみやすいメッセージ
 * - 次に取るべきアクションの明確な提示
 * - サイト内検索機能の提供
 * - おすすめコンテンツやサイトマップの表示
 * - お問い合わせやサポートへのリンク
 *
 * @returns JSX.Element - 404エラーメッセージとナビゲーションを含むページコンポーネント
 *
 * @example
 * // 以下の場面でこのページが表示されます：
 *
 * // 1. 存在しないURLへの直接アクセス
 * // https://example.com/non-existent-page → この404ページが表示
 *
 * // 2. 動的ルートで存在しないリソース
 * // https://example.com/users/999999 （存在しないユーザーID）
 * // → データ取得失敗でnotFound()呼び出し → この404ページが表示
 *
 * // 3. APIエンドポイントで404エラー
 * const api = useApiRequest();
 * const response = await api.get('/api/non-existent');
 * // → 404の場合、自動的に notFound() が呼ばれてこのページが表示
 *
 * // 4. サーバーコンポーネントでのリソース確認
 * const user = await fetchUser(params.id);
 * if (!user) {
 *   notFound(); // → この404ページが表示
 * }
 *
 * // 5. ファイルやアセットの404
 * // 存在しない画像やCSSファイルへのアクセス → この404ページが表示
 */
export default function Page() {
  return <NotFoundPage />;
}
