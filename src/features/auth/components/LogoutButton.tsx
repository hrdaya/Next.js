'use client';

import { signOutAction } from '@/features/auth/actions/SignOut';
import { useTransition } from 'react';

interface LogoutButtonProps {
  logoutText: string;
}

/**
 * ログアウトボタンコンポーネント
 *
 * useTransitionを使用してサーバーアクション実行中の状態を管理し、
 * ローディング表示とボタン無効化を実現します。
 */
export function LogoutButton({ logoutText }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      signOutAction();
    });
  };

  return (
    <>
      {/* ローディングオーバーレイ */}
      {isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
            <span className="text-gray-700">ログアウト中...</span>
          </div>
        </div>
      )}

      {/* ログアウトボタン */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className={`px-4 py-2 rounded transition-colors ${
          isPending
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {isPending ? 'ログアウト中...' : logoutText}
      </button>
    </>
  );
}
