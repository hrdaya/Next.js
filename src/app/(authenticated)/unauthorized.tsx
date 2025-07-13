import { SignIn } from '@/features/top/components/SignIn';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン',
};

export default function Page() {
  return (
    <>
      <SignIn />
    </>
  );
}
