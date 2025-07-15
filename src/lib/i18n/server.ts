/**
 * Next.js サーバーサイド国際化（SSR i18n）機能
 *
 * このファイルは、Server ComponentsやSSR環境での
 * 国際化処理を提供します。クライアントサイドのi18n設定とは
 * 独立したサーバー専用のi18nextインスタンスを管理し、
 * HTTPヘッダーベースの言語検出を行います。
 *
 * 主な機能:
 * - Accept-Languageヘッダーによる言語検出
 * - サーバーサイド翻訳処理
 * - クライアントサイドとの言語設定同期
 * - Server Componentsでの型安全な翻訳
 *
 * 設計思想:
 * - サーバーとクライアントで独立したi18nextインスタンス
 * - HTTPリクエスト単位での言語状態管理
 * - パフォーマンス重視：必要最小限の処理
 * - SEO対応：サーバーレンダリング時の適切な言語処理
 *
 * 使用場面:
 * - Server Componentsでの翻訳
 * - SSR時の初期言語設定
 * - メタデータやOGタグの多言語化
 */

import i18n from 'i18next';
import { headers } from 'next/headers';

// 翻訳ファイルのインポート
// クライアントサイドと同じ翻訳リソースを使用して一貫性を保つ
import enTranslations from '@/locales/en/common.json';
import jaTranslations from '@/locales/ja/common.json';

/**
 * サーバーサイド翻訳リソース構造
 *
 * クライアントサイドと同一の構造を維持し、
 * 翻訳内容の一貫性を確保
 */
const resources = {
  en: {
    common: enTranslations,
  },
  ja: {
    common: jaTranslations,
  },
};

/**
 * サーバーサイド専用i18nextインスタンス
 *
 * 注意事項:
 * - クライアントサイドのインスタンスと完全に独立
 * - リクエスト間での状態汚染を防ぐため、各リクエストで言語を再設定
 * - ブラウザ固有の機能（localStorage等）は使用不可
 */
const serverI18n = i18n.createInstance();

/**
 * サーバーサイドi18next初期化設定
 *
 * SSR環境に特化した設定:
 * - 言語検出プラグインを使用しない（手動で制御）
 * - React固有の設定を最小限に抑制
 * - 即座に初期化（サーバー環境では安全）
 */
serverI18n.init({
  // 翻訳リソース（クライアントと同一）
  resources,

  // フォールバック言語
  fallbackLng: 'en',

  // デフォルト名前空間
  defaultNS: 'common',

  // 利用可能な名前空間
  ns: ['common'],

  // テキスト補間設定
  interpolation: {
    // サーバーサイドでもReactが値をエスケープするため無効化
    escapeValue: false,
  },
});

/**
 * サーバーサイドでのHTTPヘッダーベース言語検出とi18n初期化
 *
 * この関数は各リクエストで呼び出され、以下の処理を行います:
 * 1. Accept-Languageヘッダーの解析
 * 2. サポート言語との照合
 * 3. 検出された言語でのi18nextインスタンス設定
 * 4. 言語情報とインスタンスの返却
 *
 * Accept-Language解析ロジック:
 * - カンマ区切りの言語リストを解析
 * - 品質値（q=0.9）を無視してシンプルに処理
 * - 地域コード（en-US）から言語コード（en）を抽出
 * - サポート言語との最初のマッチを採用
 *
 * @returns Promise<{i18n: i18next, language: string}>
 *   初期化済みi18nextインスタンスと検出言語
 */
export async function getServerI18n() {
  // Next.js headers()を使用してHTTPヘッダーを取得
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  /**
   * Accept-Languageヘッダーの解析処理
   *
   * 例: "en-US,en;q=0.9,ja;q=0.8" → ["en", "en", "ja"]
   *
   * 処理ステップ:
   * 1. カンマで分割して言語エントリごとに処理
   * 2. セミコロンで分割して品質値を除去
   * 3. 小文字に正規化
   * 4. ハイフンで分割して言語コードのみ抽出
   */
  const preferredLanguages = acceptLanguage
    .split(',')
    .map((lang: string) => lang.split(';')[0].trim().toLowerCase())
    .map((lang: string) => lang.split('-')[0]); // en-US -> en

  /**
   * サポート言語との照合
   *
   * アプリケーションでサポートしている言語の中から、
   * ユーザーの優先言語リストの最初のマッチを選択
   */
  const supportedLanguages = Object.keys(resources);
  const detectedLanguage =
    preferredLanguages.find((lang: string) =>
      supportedLanguages.includes(lang)
    ) || 'en'; // マッチしない場合は英語をフォールバック

  /**
   * 検出された言語でi18nextインスタンスを設定
   *
   * 重要: 各リクエストで言語を再設定することで、
   * 前のリクエストの言語設定が残らないようにする
   */
  await serverI18n.changeLanguage(detectedLanguage);

  return {
    i18n: serverI18n,
    language: detectedLanguage,
  };
}

/**
 * サーバーサイドでの翻訳文字列取得
 *
 * Server Componentsで直接翻訳を取得するためのヘルパー関数
 * 内部でgetServerI18n()を呼び出して言語検出を行い、
 * 適切な翻訳文字列を返却します。
 *
 * 使用例:
 * ```tsx
 * // Server Component内で
 * const title = await getServerTranslation('page.title');
 * const welcome = await getServerTranslation('messages.welcome', { name: 'John' });
 * ```
 *
 * パフォーマンス考慮:
 * - 各呼び出しで言語検出を行うため、1つのコンポーネント内では
 *   getServerI18n()を一度だけ呼び出してインスタンスを再利用することを推奨
 *
 * @param key - 翻訳キー（例: 'common.welcome'）
 * @param options - 補間用のオプション（例: { name: 'John' }）
 * @returns Promise<string> 翻訳された文字列
 */
export async function getServerTranslation(
  key: string,
  options?: Record<string, unknown>
) {
  const { i18n } = await getServerI18n();
  return i18n.t(key, options);
}
