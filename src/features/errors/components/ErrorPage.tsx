'use client';

import { ForbiddenPage } from './ForbiddenPage';
import { InternalServerErrorPage } from './InternalServerErrorPage';
import { NotFoundPage } from './NotFoundPage';
import { ServiceUnavailablePage } from './ServiceUnavailablePage';

interface ErrorPageProps {
  error?: Error & { digest?: string; statusCode?: number };
  reset?: () => void;
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
  // ステータスコードまたはエラーメッセージからエラータイプを判定
  const getErrorType = () => {
    if (error?.statusCode) {
      return error.statusCode;
    }

    // エラーメッセージからステータスコードを推測
    const message = error?.message?.toLowerCase() || '';

    if (
      message.includes('503') ||
      message.includes('service unavailable') ||
      message.includes('maintenance')
    ) {
      return 503;
    }

    if (message.includes('404') || message.includes('not found')) {
      return 404;
    }

    if (
      message.includes('403') ||
      message.includes('forbidden') ||
      message.includes('unauthorized')
    ) {
      return 403;
    }

    // デフォルトは500エラー
    return 500;
  };

  // メンテナンスメッセージの抽出
  const getMaintenanceMessage = (): string | undefined => {
    if (!error?.message) return undefined;

    try {
      // JSON形式のメッセージかチェック
      const parsed = JSON.parse(error.message);
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      // JSON以外の場合はそのまま返す
      if (
        error.message.includes('メンテナンス') ||
        error.message.includes('maintenance')
      ) {
        return error.message;
      }
    }

    return undefined;
  };

  const errorType = getErrorType();
  const maintenanceMessage = getMaintenanceMessage();

  switch (errorType) {
    case 404:
      return <NotFoundPage />;

    case 403:
      return <ForbiddenPage />;

    case 503:
      return (
        <ServiceUnavailablePage
          maintenanceMessage={maintenanceMessage}
          reset={reset}
        />
      );

    default:
      return <InternalServerErrorPage error={error} reset={reset} />;
  }
}
