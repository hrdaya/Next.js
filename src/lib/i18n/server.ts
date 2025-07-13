import i18n from 'i18next';
import { headers } from 'next/headers';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from '@/locales/en/common.json';
import jaTranslations from '@/locales/ja/common.json';

const resources = {
  en: {
    common: enTranslations,
  },
  ja: {
    common: jaTranslations,
  },
};

// Server-side i18n instance
const serverI18n = i18n.createInstance();

serverI18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

/**
 * サーバーサイドで言語を検出し、i18nインスタンスを初期化
 */
export async function getServerI18n() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  // Accept-Language ヘッダーから優先言語を抽出
  const preferredLanguages = acceptLanguage
    .split(',')
    .map((lang: string) => lang.split(';')[0].trim().toLowerCase())
    .map((lang: string) => lang.split('-')[0]); // en-US -> en

  // サポートされている言語の中から最初にマッチするものを選択
  const supportedLanguages = Object.keys(resources);
  const detectedLanguage =
    preferredLanguages.find((lang: string) =>
      supportedLanguages.includes(lang)
    ) || 'en';

  // 言語を設定
  await serverI18n.changeLanguage(detectedLanguage);

  return {
    i18n: serverI18n,
    language: detectedLanguage,
  };
}

/**
 * サーバーサイドで翻訳を取得
 */
export async function getServerTranslation(
  key: string,
  options?: Record<string, unknown>
) {
  const { i18n } = await getServerI18n();
  return i18n.t(key, options);
}
