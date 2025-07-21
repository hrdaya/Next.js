/**
 * Next.js クライアントサイド国際化（i18n）設定
 *
 * このファイルは、クライアントサイド専用のi18next設定を管理します。
 * SSR（Server-Side Rendering）環境での課題を解決し、
 * Hydrationエラーを防ぐための特別な設定を含んでいます。
 *
 * 主な機能:
 * - クライアントサイドでの言語検出と切り替え
 * - Cookieによる言語設定の永続化とサーバー同期
 * - SSR/CSR間のHydrationエラー防止
 * - TypeScript対応の型安全な翻訳機能
 *
 * 設計思想:
 * - サーバーサイドとクライアントサイドで異なる初期化戦略
 * - パフォーマンス重視：必要最小限のリソース読み込み
 * - UX重視：ユーザーの言語設定を記憶・同期
 *
 * 使用場面:
 * - クライアントコンポーネントでの翻訳
 * - 動的言語切り替え
 * - ブラウザ環境での言語検出
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// 共通の言語設定をインポート
import { supportedLanguages, supportedNamespaces } from './languages';
// 共通の翻訳リソースをインポート
import { commonResources } from './resources';

/**
 * i18next初期化設定
 *
 * Next.js App RouterでのSSR環境に最適化された設定
 * Hydrationエラーを防ぎ、クライアントサイドで適切に動作するよう調整
 */
i18n
  // ブラウザ言語検出プラグインを使用
  // ユーザーのブラウザ設定、Cookie等から言語を自動検出
  .use(LanguageDetector)

  // React統合プラグインを使用
  // useTranslation等のReact Hooksを提供
  .use(initReactI18next)

  // メイン初期化設定
  .init({
    // 翻訳リソースの設定（共通リソースを使用）
    resources: commonResources,

    // サポートされている言語の一覧
    supportedLngs: supportedLanguages,

    // フォールバック言語: 翻訳が見つからない場合の既定言語
    fallbackLng: 'en',

    // デフォルト名前空間: 明示的に指定しない場合の翻訳カテゴリ
    defaultNS: 'common',

    // 利用可能な名前空間の一覧（共通定義を使用）
    ns: supportedNamespaces,

    /**
     * 言語検出設定
     * SSR対応: Cookie使用でサーバー・クライアント間の同期を実現
     */
    detection: {
      // 言語検出の優先順位
      // 1. cookie（サーバー・クライアント間で共有可能）
      // 2. navigator（ブラウザの言語設定）
      // 3. htmlTag（HTML lang属性）
      order: ['cookie', 'navigator', 'htmlTag'],

      // 言語設定をキャッシュする場所（Cookieを使用）
      caches: ['cookie'],

      // Cookie名の設定（サーバーサイドと統一）
      lookupCookie: 'i18nextLng',
    },

    /**
     * テキスト補間設定
     * React環境での最適化
     */
    interpolation: {
      // Reactが既にXSSエスケープを行うため、重複を避ける
      escapeValue: false,
    },

    /**
     * React固有の設定
     * SSR環境での問題回避
     */
    react: {
      // SSR時にSuspenseを使用しない
      // Hydrationエラーとレンダリング問題を防止
      useSuspense: false,
    },

    /**
     * 初期化タイミング制御
     * Hydrationエラー防止の重要な設定
     */
    // 即座に初期化せず、遅延初期化を採用
    // これによりサーバーとクライアントの初期状態の不一致を防ぐ
    initImmediate: false,
  });

export default i18n;
