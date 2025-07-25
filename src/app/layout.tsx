import { DynamicFont } from '@/components/atoms/DynamicFont';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { allFontVariables, getFontClassByLang } from '@/lib/i18n/font-settings';
import { getServerI18n } from '@/lib/i18n/server';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next.js SSR App',
  description: 'Next.js SSR application with TypeScript and Tailwind CSS',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // サーバーサイドで現在選択されている言語を検出
  const { language } = await getServerI18n();

  // 言語に応じたフォントクラスを決定
  const fontClass = getFontClassByLang(language);

  return (
    <html lang={language} className={`${allFontVariables} ${fontClass}`}>
      <body>
        <I18nProvider initialLanguage={language}>
          <DynamicFont />
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
