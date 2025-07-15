'use client';

import { ErrorPage } from '@/features/errors/components/ErrorPage';

interface ErrorPageProps {
  error: Error & { digest?: string; statusCode?: number };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorPageProps) {
  return <ErrorPage error={error} reset={reset} />;
}
