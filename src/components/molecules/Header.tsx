'use client';

import { Button } from '@/components/atoms';
import { useTranslation } from 'react-i18next';

export interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { t } = useTranslation('common');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-gray-900">
            {title || 'Next.js SSR App'}
          </h1>
          {onMenuClick && (
            <Button variant="outline" size="sm" onClick={onMenuClick}>
              {t('Navigation.menu')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
