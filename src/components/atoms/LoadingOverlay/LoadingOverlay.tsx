'use client';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

/**
 * 全画面ローディングオーバーレイコンポーネント
 *
 * ログアウト処理中やその他の重要な処理中に
 * 画面全体を覆うローディング表示を提供します。
 */
export function LoadingOverlay({
  isVisible,
  message = '処理中...',
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center space-y-4 max-w-sm w-full mx-4">
        {/* スピナー */}
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200" />
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent absolute inset-0" />
        </div>

        {/* メッセージ */}
        <div className="text-center">
          <p className="text-gray-700 font-medium">{message}</p>
          <p className="text-gray-500 text-sm mt-1">しばらくお待ちください</p>
        </div>

        {/* プログレスバー風エフェクト */}
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-red-600 h-1 rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>
  );
}
