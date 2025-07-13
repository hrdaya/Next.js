'use client';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '500',
};

export default function Page() {
  return (
    <div>
      <h1>500 Internal Server Error</h1>
    </div>
  );
}
