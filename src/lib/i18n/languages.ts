/**
 * 言語設定ファイル
 *
 * 新しい言語を追加する場合は、このファイルのlanguagesConfigに追加するだけで
 * アプリケーション全体で使用できるようになります。
 */

export interface LanguageConfig {
  /** 言語コード（ISO 639-1形式） */
  code: string;
  /** 言語の表示名（その言語で表記） */
  name: string;
  /** 言語の表示名（英語で表記） */
  englishName: string;
  /** フラグの絵文字または国旗アイコン */
  flag: string;
  /** RTL（右から左へ）かどうか */
  isRTL?: boolean;
}

/**
 * 利用可能な言語の設定
 *
 * 新しい言語を追加する手順:
 * 1. ここに言語設定を追加
 * 2. src/locales/{languageCode}/ フォルダを作成
 * 3. 翻訳ファイル（common.json, auth.json等）を追加
 * 4. src/lib/i18n/client.ts と src/lib/i18n/server.ts で共通リソースを使用（自動適用）
 */
export const languagesConfig: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    englishName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'ja',
    name: '日本語',
    englishName: 'Japanese',
    flag: '🇯🇵',
  },
  // 将来追加予定の言語例:
  // {
  //   code: 'ko',
  //   name: '한국어',
  //   englishName: 'Korean',
  //   flag: '🇰🇷',
  // },
  // {
  //   code: 'zh',
  //   name: '中文',
  //   englishName: 'Chinese',
  //   flag: '🇨🇳',
  // },
  // {
  //   code: 'es',
  //   name: 'Español',
  //   englishName: 'Spanish',
  //   flag: '🇪🇸',
  // },
  // {
  //   code: 'fr',
  //   name: 'Français',
  //   englishName: 'French',
  //   flag: '🇫🇷',
  // },
  // {
  //   code: 'de',
  //   name: 'Deutsch',
  //   englishName: 'German',
  //   flag: '🇩🇪',
  // },
  // {
  //   code: 'pt',
  //   name: 'Português',
  //   englishName: 'Portuguese',
  //   flag: '🇵🇹',
  // },
  // {
  //   code: 'ru',
  //   name: 'Русский',
  //   englishName: 'Russian',
  //   flag: '🇷🇺',
  // },
  // {
  //   code: 'ar',
  //   name: 'العربية',
  //   englishName: 'Arabic',
  //   flag: '🇸🇦',
  //   isRTL: true,
  // },
];

/**
 * 言語コードから言語設定を取得
 */
export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return languagesConfig.find((lang) => lang.code === code);
}

/**
 * デフォルト言語の設定
 */
export const defaultLanguage = languagesConfig[0]; // English

/**
 * サポートされている言語コードの配列
 */
export const supportedLanguages = languagesConfig.map((lang) => lang.code);

/**
 * サポートされている名前空間の定義
 * サーバーサイド・クライアントサイド共通
 */
export const supportedNamespaces = [
  'common',
  'dashboard',
  'errors',
  'auth',
] as const;

/**
 * 名前空間の型定義
 */
export type SupportedNamespace = (typeof supportedNamespaces)[number];

/**
 * 翻訳リソース構造の型定義
 * サーバーサイド・クライアントサイド共通で使用
 */
export type TranslationResources = {
  [K in (typeof supportedLanguages)[number]]: {
    [N in SupportedNamespace]: Record<string, string | Record<string, string>>;
  };
};

/**
 * 言語コードの有効性チェック
 * @param languageCode - チェックする言語コード
 * @returns 有効な言語コードかどうか
 */
export function isValidLanguageCode(
  languageCode: string
): languageCode is (typeof supportedLanguages)[number] {
  return supportedLanguages.includes(
    languageCode as (typeof supportedLanguages)[number]
  );
}

/**
 * 安全な言語コード取得
 * 無効な言語コードの場合はデフォルト言語を返す
 * @param languageCode - チェックする言語コード
 * @returns 有効な言語コード
 */
export function getSafeLanguageCode(
  languageCode?: string
): (typeof supportedLanguages)[number] {
  if (languageCode && isValidLanguageCode(languageCode)) {
    return languageCode;
  }
  return defaultLanguage.code as (typeof supportedLanguages)[number];
}
