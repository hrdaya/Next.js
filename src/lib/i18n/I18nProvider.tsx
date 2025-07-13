'use client';

import i18n from '@/lib/i18n/i18n';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: string;
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      if (!i18n.isInitialized) {
        await i18n.init();
      }

      // サーバーから受け取った初期言語を設定（SSR対応）
      if (initialLanguage && i18n.language !== initialLanguage) {
        await i18n.changeLanguage(initialLanguage);
      }

      setIsInitialized(true);
    };

    initializeI18n();
  }, [initialLanguage]);

  // i18nが初期化されるまで何もレンダリングしない（hydration対応）
  if (!isInitialized) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
