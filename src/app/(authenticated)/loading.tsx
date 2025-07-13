'use client';

import { useTranslation } from 'react-i18next';

export default function Loading() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      <p className="text-gray-600">{t('Common.loading')}</p>
    </div>
  );
}
