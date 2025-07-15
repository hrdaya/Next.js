'use client';

import { Button } from '@/components/atoms';
import { LanguageSelector } from '@/components/molecules';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function ForbiddenPage() {
  const { t } = useTranslation('errors');
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleContactSupport = () => {
    // サポートページや問い合わせフォームに遷移
    console.log('Contact support clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-red-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-orange-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-yellow-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000" />
      </div>

      {/* Language Selector */}
      <div className="absolute top-6 right-6">
        <LanguageSelector variant="compact" size="sm" />
      </div>

      {/* Main Content */}
      <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* 403 Animation */}
        <div className="relative mb-8">
          <div className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 animate-pulse">
            403
          </div>
          <div className="absolute inset-0 text-8xl sm:text-9xl font-bold text-white/10 animate-ping">
            403
          </div>
        </div>

        {/* Lock Icon with Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500/50 to-orange-500/50 rounded-full blur-lg animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('forbidden.title')}
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {t('forbidden.description')}
          </p>
          <p className="text-lg text-gray-400">{t('forbidden.suggestion')}</p>
        </div>

        {/* Warning Card */}
        <div className="mb-12 bg-red-500/20 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-3">
            <svg
              className="w-8 h-8 text-red-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-red-300">
              {t('forbidden.warningTitle')}
            </h3>
          </div>
          <p className="text-red-200">{t('forbidden.warningMessage')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleGoHome}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 px-8 py-3 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {t('forbidden.goHome')}
          </Button>

          <Button
            onClick={handleGoBack}
            variant="outline"
            size="lg"
            className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t('forbidden.goBack')}
          </Button>

          <Button
            onClick={handleContactSupport}
            variant="outline"
            size="lg"
            className="border-2 border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10 px-8 py-3 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {t('forbidden.contactSupport')}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="text-sm text-gray-400">{t('forbidden.helpText')}</p>
        </div>
      </div>

      {/* Floating Warning Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75" />
      <div className="absolute bottom-20 right-20 w-6 h-6 bg-orange-400 rounded-full animate-ping opacity-50 animation-delay-1000" />
      <div className="absolute top-1/3 right-10 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-60 animation-delay-3000" />
    </div>
  );
}
