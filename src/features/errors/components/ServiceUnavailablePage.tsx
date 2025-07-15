'use client';

import { Button } from '@/components/atoms';
import { LanguageSelector } from '@/components/molecules';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ServiceUnavailablePageProps {
  maintenanceMessage?: string;
  reset?: () => void;
}

export function ServiceUnavailablePage({
  maintenanceMessage,
  reset,
}: ServiceUnavailablePageProps) {
  const { t } = useTranslation('errors');
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(300); // 5分後に自動リトライ

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  const handleCheckStatus = () => {
    // ステータスページへ遷移
    console.log('Check status clicked');
    window.open('https://status.example.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000" />
      </div>

      {/* Language Selector */}
      <div className="absolute top-6 right-6">
        <LanguageSelector variant="compact" size="sm" />
      </div>

      {/* Main Content */}
      <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* 503 Animation */}
        <div className="relative mb-8">
          <div className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 animate-pulse">
            503
          </div>
          <div className="absolute inset-0 text-8xl sm:text-9xl font-bold text-white/10 animate-ping">
            503
          </div>
        </div>

        {/* Maintenance Icon with Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-bounce">
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/50 to-indigo-500/50 rounded-full blur-lg animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('serviceUnavailable.title')}
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {t('serviceUnavailable.description')}
          </p>
          <p className="text-lg text-gray-400">
            {t('serviceUnavailable.suggestion')}
          </p>
        </div>

        {/* Maintenance Message Card */}
        {maintenanceMessage && (
          <div className="mb-8 bg-blue-500/20 border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-3">
              <svg
                className="w-8 h-8 text-blue-400 mr-3"
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-blue-300">
                {t('serviceUnavailable.maintenanceNotice')}
              </h3>
            </div>
            <p className="text-blue-200">{maintenanceMessage}</p>
          </div>
        )}

        {/* Auto Retry Timer */}
        <div className="mb-8 bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-center">
            <svg
              className="w-6 h-6 text-indigo-400 mr-2 animate-spin"
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
            <span className="text-indigo-300">
              {timeLeft > 0
                ? t('serviceUnavailable.autoRetryIn', {
                    time: formatTime(timeLeft),
                  })
                : t('serviceUnavailable.retryNow')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleRetry}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 px-8 py-3 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
            {t('serviceUnavailable.retry')}
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
            {t('serviceUnavailable.goHome')}
          </Button>

          <Button
            onClick={handleCheckStatus}
            variant="outline"
            size="lg"
            className="border-2 border-purple-400/50 text-purple-300 hover:bg-purple-400/10 px-8 py-3 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {t('serviceUnavailable.checkStatus')}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="text-sm text-gray-400">
            {t('serviceUnavailable.helpText')}
          </p>
        </div>
      </div>

      {/* Floating Maintenance Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75" />
      <div className="absolute bottom-20 right-20 w-6 h-6 bg-indigo-400 rounded-full animate-ping opacity-50 animation-delay-1000" />
      <div className="absolute top-1/3 right-10 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-60 animation-delay-3000" />
    </div>
  );
}
