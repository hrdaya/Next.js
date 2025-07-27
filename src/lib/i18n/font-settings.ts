import {
  Inter,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Sans_SC,
} from 'next/font/google';

// 1. 各フォントを読み込む
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  weight: ['400', '700'],
});

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
  weight: ['400', '700'],
});

const notoSansSc = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
  weight: ['400', '700'],
});

// 2. フォント設定を集中管理するオブジェクト
export const fontSettings = {
  en: {
    fontClass: 'font-sans',
    variable: inter.variable,
  },
  ja: {
    fontClass: 'font-sans-jp',
    variable: notoSansJp.variable,
  },
  ko: {
    fontClass: 'font-sans-kr',
    variable: notoSansKr.variable,
  },
  zh: {
    fontClass: 'font-sans-sc',
    variable: notoSansSc.variable,
  },
};

// 3. サポートされているすべてのフォント変数を結合
export const allFontVariables = Object.values(fontSettings)
  .map((f) => f.variable)
  .join(' ');

// 4. 言語コードに対応するフォントクラスを取得するヘルパー関数
export const getFontClassByLang = (lang: string): string => {
  return (
    fontSettings[lang as keyof typeof fontSettings]?.fontClass ||
    fontSettings.en.fontClass
  );
};
