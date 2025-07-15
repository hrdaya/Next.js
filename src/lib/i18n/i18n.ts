/**
 * Next.js国際化（i18n）設定
 *
 * このファイルは、クライアントサイドでのi18next設定を管理します。
 * SSR（Server-Side Rendering）環境での課題を解決し、
 * Hydrationエラーを防ぐための特別な設定を含んでいます。
 *
 * 主な機能:
 * - クライアントサイドでの言語検出と切り替え
 * - ローカルストレージによる言語設定の永続化
 * - SSR/CSR間のHydrationエラー防止
 * - TypeScript対応の型安全な翻訳機能
 *
 * 設計思想:
 * - サーバーサイドとクライアントサイドで異なる初期化戦略
 * - パフォーマンス重視：必要最小限のリソース読み込み
 * - UX重視：ユーザーの言語設定を記憶
 *
 * 使用場面:
 * - クライアントコンポーネントでの翻訳
 * - 動的言語切り替え
 * - ブラウザ環境での言語検出
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// 言語設定をインポート
import { supportedLanguages } from './languages';

import enAuth from '@/locales/en/auth.json';
// 翻訳ファイルのインポート
// 各言語の翻訳リソースを静的インポートで読み込み
// 注意: 動的インポートよりも静的インポートを使用してバンドルサイズを最適化
import enTranslations from '@/locales/en/common.json';
import enDashboard from '@/locales/en/dashboard.json';
import enErrors from '@/locales/en/errors.json';
import jaAuth from '@/locales/ja/auth.json';
import jaTranslations from '@/locales/ja/common.json';
import jaDashboard from '@/locales/ja/dashboard.json';
import jaErrors from '@/locales/ja/errors.json';

/**
 * 翻訳リソースの構造定義
 *
 * 言語コード（'en', 'ja'）をキーとし、
 * 各言語に対して名前空間別の翻訳データを格納
 *
 * 構造:
 * {
 *   [languageCode]: {
 *     [namespace]: translationData
 *   }
 * }
 */
const resources = {
  en: {
    common: enTranslations,
    dashboard: enDashboard,
    errors: enErrors,
    auth: enAuth,
  },
  ja: {
    common: jaTranslations,
    dashboard: jaDashboard,
    errors: jaErrors,
    auth: jaAuth,
  },
};

/**
 * i18next初期化設定
 *
 * Next.js App RouterでのSSR環境に最適化された設定
 * Hydrationエラーを防ぎ、クライアントサイドで適切に動作するよう調整
 */
i18n
  // ブラウザ言語検出プラグインを使用
  // ユーザーのブラウザ設定、localStorage等から言語を自動検出
  .use(LanguageDetector)

  // React統合プラグインを使用
  // useTranslation等のReact Hooksを提供
  .use(initReactI18next)

  // メイン初期化設定
  .init({
    // 翻訳リソースの設定
    resources,

    // サポートされている言語の一覧
    supportedLngs: supportedLanguages,

    // フォールバック言語: 翻訳が見つからない場合の既定言語
    fallbackLng: 'en',

    // デフォルト名前空間: 明示的に指定しない場合の翻訳カテゴリ
    defaultNS: 'common',

    // 利用可能な名前空間の一覧
    ns: ['common', 'dashboard', 'errors', 'auth'],

    /**
     * 言語検出設定
     * SSR対応: サーバーサイドでの言語検出問題を回避
     */
    detection: {
      // 言語検出の優先順位
      // 1. localStorage（ユーザーの明示的な選択）
      // 2. navigator（ブラウザの言語設定）
      // 3. htmlTag（HTML lang属性）
      order: ['localStorage', 'navigator', 'htmlTag'],

      // 言語設定をキャッシュする場所
      caches: ['localStorage'],

      // ブラウザ環境でのみlocalStorageを使用
      // SSR時にはwindowオブジェクトが存在しないため条件分岐
      ...(typeof window !== 'undefined' && {
        lookupLocalStorage: 'i18nextLng',
      }),
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
