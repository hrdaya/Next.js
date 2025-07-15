import { ForbiddenPage } from '@/features/errors/components/ForbiddenPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '403 - Access Forbidden',
  description: 'You do not have permission to access this resource.',
};

export default function Page() {
  return <ForbiddenPage />;
}
