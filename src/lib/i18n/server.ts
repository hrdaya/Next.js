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
import { cookies } from 'next/headers';

// 共通の言語設定をインポート
import { supportedLanguages, supportedNamespaces } from './languages';
// 共通の翻訳リソースをインポート
import { commonResources } from './resources';

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
  // 翻訳リソース（クライアントと同一の共通リソースを使用）
  resources: commonResources,

  // フォールバック言語
  fallbackLng: 'en',

  // デフォルト名前空間
  defaultNS: 'common',

  // 利用可能な名前空間（共通定義を使用）
  ns: supportedNamespaces,

  // テキスト補間設定
  interpolation: {
    // サーバーサイドでもReactが値をエスケープするため無効化
    escapeValue: false,
  },
});

/**
 * サーバーサイドでの多段階言語検出とi18n初期化
 *
 * この関数は各リクエストで呼び出され、以下の処理を行います:
 * 1. 複数ソースからの言語検出（優先順位付き）
 * 2. サポート言語との照合
 * 3. 検出された言語でのi18nextインスタンス設定
 * 4. 言語情報とインスタンスの返却
 *
 * 言語検出の優先順位（クライアントサイドと類似した戦略）:
 * 1. Cookie（ユーザーの明示的な選択を記憶）
 * 2. Accept-Languageヘッダー（ブラウザ設定）
 * 3. フォールバック言語（en）
 *
 * @returns Promise<{i18n: i18next, language: string}>
 *   初期化済みi18nextインスタンスと検出言語
 */
export async function getServerI18n() {
  // Next.js headers()を使用してHTTPヘッダーを取得
  const headersList = await headers();
  const supportedLanguagesList = supportedLanguages;

  /**
   * 1. Cookie からの言語検出（最優先）
   *
   * ユーザーが明示的に選択した言語設定を尊重
   * クライアントサイドのlocalStorageと同期するためのCookie
   */
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get('i18nextLng')?.value;

  if (cookieLanguage && supportedLanguagesList.includes(cookieLanguage)) {
    await serverI18n.changeLanguage(cookieLanguage);
    return {
      i18n: serverI18n,
      language: cookieLanguage,
    };
  }

  /**
   * 2. Accept-Languageヘッダーからの言語検出
   *
   * 例: "en-US,en;q=0.9,ja;q=0.8" → ["en", "en", "ja"]
   *
   * 処理ステップ:
   * 1. カンマで分割して言語エントリごとに処理
   * 2. セミコロンで分割して品質値を除去
   * 3. 小文字に正規化
   * 4. ハイフンで分割して言語コードのみ抽出
   */
  const acceptLanguage = headersList.get('accept-language') || '';
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
  const detectedLanguage =
    preferredLanguages.find((lang: string) =>
      supportedLanguagesList.includes(lang)
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

/**
 * サーバーサイドでの言語設定Cookie更新
 *
 * ユーザーが言語を変更した際に、サーバーサイドからCookieを設定するためのヘルパー関数
 * クライアントサイドのlocalStorageと同期を取るため、同じキー名を使用
 *
 * 使用例:
 * ```tsx
 * // Server Action内で
 * import { setServerLanguageCookie } from '@/lib/i18n/server';
 *
 * async function changeLanguage(language: string) {
 *   'use server';
 *   await setServerLanguageCookie(language);
 *   // リダイレクトやrevalidateなどの処理
 * }
 * ```
 *
 * @param language - 設定する言語コード（例: 'en', 'ja'）
 */
export async function setServerLanguageCookie(language: string) {
  const cookieStore = await cookies();

  // クライアントサイドと同じキー名でCookieを設定
  cookieStore.set('i18nextLng', language, {
    httpOnly: false, // クライアントサイドからも読み取り可能
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 365 * 24 * 60 * 60, // 1年間有効
    path: '/',
  });
}

/**
 * サーバーサイドでの現在の言語取得
 *
 * Server Componentsで現在の言語設定のみを取得したい場合のヘルパー関数
 * 翻訳処理は不要で、言語情報だけが必要な場合に使用
 *
 * 使用例:
 * ```tsx
 * // Server Component内で
 * const currentLanguage = await getCurrentServerLanguage();
 * ```
 *
 * @returns Promise<string> 現在の言語コード
 */
export async function getCurrentServerLanguage(): Promise<string> {
  const { language } = await getServerI18n();
  return language;
}
