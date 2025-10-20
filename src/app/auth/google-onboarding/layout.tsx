import React, { Suspense } from 'react';

export default function GoogleOnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading…</div>}>
      {children}
    </Suspense>
  );
}
