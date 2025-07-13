'use client';

import { Button } from '@/components/atoms';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="min-w-[60px]"
    >
      {i18n.language === 'en' ? '日本語' : 'English'}
    </Button>
  );
}
