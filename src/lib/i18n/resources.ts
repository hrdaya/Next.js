/**
 * 翻訳リソース共通定義
 *
 * サーバーサイドとクライアントサイドで共通の
 * 翻訳リソース構造を提供します。
 */

// 翻訳ファイルのインポート
import enAuth from '@/locales/en/auth.json';
import enTranslations from '@/locales/en/common.json';
import enDashboard from '@/locales/en/dashboard.json';
import enErrors from '@/locales/en/errors.json';
import jaAuth from '@/locales/ja/auth.json';
import jaTranslations from '@/locales/ja/common.json';
import jaDashboard from '@/locales/ja/dashboard.json';
import jaErrors from '@/locales/ja/errors.json';

/**
 * 共通翻訳リソース構造
 *
 * サーバーサイドとクライアントサイドで同一の構造を使用
 * 新しい言語や名前空間を追加する場合は、ここを更新するだけで
 * 両方の環境で利用可能になります。
 *
 * 構造:
 * {
 *   [languageCode]: {
 *     [namespace]: translationData
 *   }
 * }
 */
export const commonResources = {
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
} as const;

/**
 * リソース型定義（型安全性のために使用）
 */
export type ResourceType = typeof commonResources;
