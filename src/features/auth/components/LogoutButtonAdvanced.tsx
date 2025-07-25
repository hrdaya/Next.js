'use client';

import { LoadingOverlay } from '@/components/atoms';
import { signOutAction } from '@/features/auth/actions/SignOut';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface LogoutButtonAdvancedProps {
  logoutText: string;
}

/**
 * 高度なローディング表示付きログアウトボタンコンポーネント
 *
 * LoadingOverlayコンポーネントを使用してより洗練されたローディング表示を提供します。
 */
export function LogoutButtonAdvanced({
  logoutText,
}: LogoutButtonAdvancedProps) {
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation('common');

  const handleLogout = () => {
    startTransition(() => {
      signOutAction();
    });
  };

  return (
    <>
      <LoadingOverlay isVisible={isPending} message={t('Common.loggingOut')} />

      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className={`px-4 py-2 rounded transition-all duration-200 ${
          isPending
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed scale-95'
            : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 active:scale-95'
        }`}
      >
        {isPending ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>{t('Common.processing')}</span>
          </div>
        ) : (
          logoutText
        )}
      </button>
    </>
  );
}
