import { I18nProvider } from '@/lib/i18n/I18nProvider';
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
  // サーバーサイドで言語を検出
  const { language } = await getServerI18n();

  return (
    <html lang={language}>
      <body>
        <I18nProvider initialLanguage={language}>
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
