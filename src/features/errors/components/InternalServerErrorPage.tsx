'use client';

import { Button } from '@/components/atoms';
import { LanguageSelector } from '@/components/molecules';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface InternalServerErrorPageProps {
  reset?: () => void;
  error?: Error & { digest?: string };
}

export function InternalServerErrorPage({
  error,
  reset,
}: InternalServerErrorPageProps) {
  const { t } = useTranslation('errors');
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  const handleReportIssue = () => {
    // バグレポートページや問い合わせフォームに遷移
    console.log('Report issue clicked', {
      error: error?.message,
      digest: error?.digest,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-600/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gray-600/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-red-800/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000" />
      </div>

      {/* Language Selector */}
      <div className="absolute top-6 right-6">
        <LanguageSelector variant="compact" size="sm" />
      </div>

      {/* Main Content */}
      <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* 500 Animation */}
        <div className="relative mb-8">
          <div className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-gray-400 to-red-600 animate-pulse">
            500
          </div>
          <div className="absolute inset-0 text-8xl sm:text-9xl font-bold text-white/10 animate-ping">
            500
          </div>
        </div>

        {/* Server Error Icon with Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-red-600 to-gray-600 rounded-full flex items-center justify-center animate-bounce">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01"
                />
              </svg>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600/50 to-gray-600/50 rounded-full blur-lg animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('internalServerError.title')}
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {t('internalServerError.description')}
          </p>
          <p className="text-lg text-gray-400">
            {t('internalServerError.suggestion')}
          </p>
        </div>

        {/* Error Details Card */}
        {error && (
          <div className="mb-8 bg-red-500/20 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
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
                {t('internalServerError.technicalDetails')}
              </h3>
            </div>
            <div className="text-left">
              {error.digest && (
                <p className="text-red-200 mb-2">
                  <span className="font-semibold">
                    {t('internalServerError.errorId')}:
                  </span>{' '}
                  {error.digest}
                </p>
              )}
              <p className="text-red-200 text-sm font-mono bg-red-900/30 p-2 rounded">
                {error.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleRetry}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-gray-600 hover:from-red-700 hover:to-gray-700 text-white border-0 px-8 py-3 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t('internalServerError.retry')}
          </Button>

          <Button
            onClick={handleGoHome}
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {t('internalServerError.goHome')}
          </Button>

          <Button
            onClick={handleGoBack}
            variant="outline"
            size="lg"
            className="border-2 border-gray-400/50 text-gray-300 hover:bg-gray-400/10 px-8 py-3 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
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
            {t('internalServerError.goBack')}
          </Button>

          <Button
            onClick={handleReportIssue}
            variant="outline"
            size="lg"
            className="border-2 border-blue-400/50 text-blue-300 hover:bg-blue-400/10 px-8 py-3 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            {t('internalServerError.reportIssue')}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="text-sm text-gray-400">
            {t('internalServerError.helpText')}
          </p>
        </div>
      </div>

      {/* Floating Error Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75" />
      <div className="absolute bottom-20 right-20 w-6 h-6 bg-gray-400 rounded-full animate-ping opacity-50 animation-delay-1000" />
      <div className="absolute top-1/3 right-10 w-3 h-3 bg-red-600 rounded-full animate-ping opacity-60 animation-delay-3000" />
    </div>
  );
}
