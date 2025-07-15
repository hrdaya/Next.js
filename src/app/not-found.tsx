import { NotFoundPage } from '@/features/errors/components/NotFoundPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found.',
};

export default function Page() {
  return <NotFoundPage />;
}
