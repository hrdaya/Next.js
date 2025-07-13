'use client';

import { Button } from '@/components/atoms';
import { Header } from '@/components/molecules';
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher';
import { useSession } from 'next-auth/react';
import { forbidden, notFound, unauthorized } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t } = useTranslation();
  const { data: session } = useSession();

  const handleGetStarted = () => {
    console.log('Get started clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="fixed top-4 right-4">
        <LanguageSwitcher />
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {t('HomePage.title')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {t('HomePage.description')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button onClick={handleGetStarted} size="lg">
                {t('HomePage.getStarted')}
              </Button>
              <Button variant="outline" size="lg">
                {t('HomePage.learnMore')}
              </Button>
            </div>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                onClick={() => unauthorized()}
                size="sm"
                variant="secondary"
              >
                Unauthorized
              </Button>
              <Button onClick={() => forbidden()} size="sm" variant="secondary">
                Forbidden
              </Button>
              <Button onClick={() => notFound()} size="sm" variant="outline">
                Not Found
              </Button>
            </div>
            {session && (
              <div className="mt-4">
                <p>Signed in as {session.user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
