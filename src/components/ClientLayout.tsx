'use client';

import FloatingTimer from './FloatingTimer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FloatingTimer />
      {children}
    </>
  );
}
