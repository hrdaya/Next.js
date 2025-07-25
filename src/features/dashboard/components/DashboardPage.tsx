'use client';

import { Button } from '@/components/atoms';
import { Header, LanguageSelector } from '@/components/molecules';
import { useSession } from 'next-auth/react';
import { forbidden, notFound, unauthorized } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { data: session } = useSession();

  const handleViewAnalytics = () => {
    console.log('View analytics clicked');
  };

  const handleManageSettings = () => {
    console.log('Manage settings clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="fixed top-4 right-4">
        <LanguageSelector variant="compact" size="sm" />
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t('welcome')}
            </h1>
            {session && (
              <p className="mt-4 text-lg text-gray-600">
                {t('welcomeBack', { name: session.user?.email })}
              </p>
            )}
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('quickStats')}
              </h3>
              <p className="text-sm text-gray-600">{t('statsDescription')}</p>
              <div className="mt-4">
                <span className="text-2xl font-bold text-blue-600">42</span>
                <span className="text-sm text-gray-500 ml-2">
                  {t('totalItems')}
                </span>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('recentActivity')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('activityDescription')}
              </p>
              <div className="mt-4">
                <span className="text-2xl font-bold text-green-600">12</span>
                <span className="text-sm text-gray-500 ml-2">
                  {t('newUpdates')}
                </span>
              </div>
            </div>

            {/* System Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('systemStatus')}
              </h3>
              <p className="text-sm text-gray-600">{t('statusDescription')}</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {t('operational')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-x-6 mb-6">
              <Button onClick={handleViewAnalytics} size="lg">
                {t('viewAnalytics')}
              </Button>
              <Button
                onClick={handleManageSettings}
                variant="outline"
                size="lg"
              >
                {t('manageSettings')}
              </Button>
            </div>

            {/* Developer Test Buttons */}
            <div className="flex items-center justify-center gap-x-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">{t('testPages')}</p>
            </div>
            <div className="flex items-center justify-center gap-x-6">
              <Button
                onClick={() => unauthorized()}
                size="sm"
                variant="secondary"
              >
                {t('errors:unauthorized')}
              </Button>
              <Button onClick={() => forbidden()} size="sm" variant="secondary">
                {t('errors:forbidden')}
              </Button>
              <Button onClick={() => notFound()} size="sm" variant="outline">
                {t('errors:notFound')}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
